const https = require('https');
const cron = require('node-cron');
const { parse, differenceInMinutes } = require('date-fns');
const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');

// Replace with your RSS feed URL
const rssFeedURL = 'https://feeds.feedburner.com/hi10anime/qang95rcihi';

// Replace with the icon URL
const iconURL = 'https://images-ext-1.discordapp.net/external/tfjokmvbiCUQ1H5JDeFnVAyNcoO5kAi3jCW0FLEQ8hA/https/ub3r-b0t.com/img/rss.png';

// Variable to store the link of the latest processed item
let latestProcessedLink = null;

// Function to execute the RSS feed check command
module.exports = async (client) => {
  const executeRssFeedCheckCommand = async () => {
    try {   
      const parser = new Parser();
      const feed = await parser.parseURL(rssFeedURL);

      // Log the last 16 entries in the RSS feed
      const last16Entries = feed.items.slice(0, 16).map(item => item.title);
      console.log('Last 16 entries in the RSS feed:', last16Entries);

      // Check if there are new items since the latest processed item
      const newEntries = feed.items.filter(item => {
        const pubDate = new Date(item.pubDate);
        const minutesAgo = differenceInMinutes(new Date(), pubDate);
        return minutesAgo <= 60 && item.link !== latestProcessedLink;
      });

      // Log the new entries
      const newEntriesTitles = newEntries.map(item => item.title);
      console.log('New entries since the last check:', newEntriesTitles);

      // Explicitly log "No new entries found" message
      if (newEntries.length === 0) {
        console.log('No new entries found since the last check.');
        return;
      }

      // Process new entries in reverse order (oldest to newest)
      const embeds = [];
      newEntries.reverse().forEach(async (currentPost) => {
        const pubDate = new Date(currentPost.pubDate);
        const minutesAgo = differenceInMinutes(new Date(), pubDate);

        // Check if the item is within the last 10 minutes
        if (minutesAgo <= 60) {
          // Remove extra newlines from the content
          const cleanedDescription = currentPost.contentSnippet.replace(/\n+/g, '\n').trim();

          const embed = new EmbedBuilder()
            .setAuthor({ name: 'Meiru-Nee-Main', iconURL })
            .setTitle(currentPost.title)
            .setDescription(cleanedDescription)
            .setURL(currentPost.link)
            .setColor('#3498db')
            .setTimestamp();

          embeds.push(embed);

          console.log('Embed added for new RSS feed item:', currentPost.title);
        }
      });

      // Send all embeds at once
      if (embeds.length > 0) {
        const guild = await client.guilds.fetch('691793566556487731').catch(console.error);
        const channel = await guild.channels.fetch('1195515449715208282').catch(console.error);

        await channel.send({
          embeds: embeds
        });

        console.log('Embeds sent successfully for new RSS feed items.');

        // Update the latest processed item link outside the loop
        latestProcessedLink = newEntries[0].link;
      }
    } catch (error) {
      console.error('An error occurred while checking the RSS feed:', error);
      console.log(':x: An error occurred while checking the RSS feed.');
    }
  };

  executeRssFeedCheckCommand();

  // Schedule the command to run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('Running RSS feed check...');
    executeRssFeedCheckCommand();
  });
};