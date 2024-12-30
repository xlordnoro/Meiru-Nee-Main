const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkbook_indigo')
    .setDescription('Checks the stock availability of a book by its title on indigo.')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('The title of the book to check')
        .setRequired(true)),
  
  async execute(interaction) {
    const bookTitle = interaction.options.getString('title');
    const searchUrl = `https://www.indigo.ca/en-ca/search/?keywords=${encodeURIComponent(bookTitle)}`;
    
    await interaction.deferReply({ ephemeral: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2' }); // Wait until the page is fully loaded

      // Find the first search result matching the title
      const bookPageUrl = await page.evaluate((title) => {
        const links = Array.from(document.querySelectorAll('a.link.secondary h3')); // Select all relevant h3 tags
        const matchingLink = links.find(link =>
          link.textContent.trim().toLowerCase() === title.toLowerCase()
        );
        return matchingLink ? matchingLink.parentElement.href : null; // Get the href from the parent <a>
      }, bookTitle);

      if (!bookPageUrl) {
        await browser.close();
        return await interaction.editReply({
          content: `❌ No results found for "${bookTitle}". Please check the title and try again.`,
          ephemeral: true,
        });
      }

      // Navigate to the book's page
      await page.goto(bookPageUrl, { waitUntil: 'domcontentloaded' });

      // Wait for the Paperback option and click it
      await page.waitForSelector('span.format-value.block-value.swatch-value.selected.selectable', { visible: true });
      await page.click('span.format-value.block-value.swatch-value.selectable[data-attr-value="TP"]');

      await new Promise(r => setTimeout(r, 3000)); // 3-second delay

      // Extract stock information
      const stockStatus = await page.evaluate(() => {
        const notifyMeElement = document.querySelector('p.delivery-option-details.notify-me');
        if (notifyMeElement) {
          const text = notifyMeElement.textContent.trim();
          if (text === 'Out of stock online') {
            return { available: false, shippingDelay: false };
          } else if (text.startsWith('Ships within')) {
            const weeksMatch = text.match(/Ships within (\d+)-(\d+) weeks/);
            return {
              available: true,
              shippingDelay: true,
              weeks: weeksMatch ? `${weeksMatch[1]}-${weeksMatch[2]}` : 'N/A'
            };
          }
          return { available: true, shippingDelay: false };
        }
      
        const stockElement = document.querySelector('p.delivery-option-details.mouse span:nth-child(2)');
        if (stockElement) {
          const inStockMatch = stockElement.textContent.match(/In stock online|Ships within (\d+)-(\d+) weeks/);
          if (inStockMatch) {
            return {
              available: true,
              shippingDelay: inStockMatch[0].includes('Ships within'),
              weeks: `${inStockMatch[1]}-${inStockMatch[2]}`,
            };
          }
        }
  
        return { available: false, shippingDelay: false };
      });      

      const responseMessage = stockStatus.available
        ? stockStatus.shippingDelay
          ? `✅ **${bookTitle}** is available for purchase online or in-store, but with a shipping delay of **${stockStatus.weeks} weeks**.`
          : `✅ **${bookTitle}** is available for purchase online or in-store.`
        : `❌ **${bookTitle}** is out of stock online.`;

      await interaction.editReply({ content: responseMessage, ephemeral: true });
    } catch (error) {
      console.error('Error checking book stock:', error);
      await interaction.editReply({
        content: '❌ An error occurred while checking the book stock. Please try again later.',
        ephemeral: true,
      });
    } finally {
      await browser.close();
    }
  },
};