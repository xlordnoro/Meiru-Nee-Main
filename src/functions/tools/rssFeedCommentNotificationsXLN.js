const fs = require('fs');
const path = require('path');
const https = require('https');
const cron = require('node-cron');
const { differenceInMinutes } = require('date-fns');
const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');

// Replace with your RSS feed URL
const rssFeedURL = 'https://hi10anime.com/comments/feed';

// File path to store processed entries
const filePath = path.join(`${__dirname}/../../json/processedCommentEntries_XLN.json`);

// Function to read processed entries from the file
const readProcessedEntries = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return new Set(JSON.parse(data));
  } catch (error) {
    // If the file doesn't exist or there's an error reading, return an empty set
    return new Set();
  }
};

// Function to write processed entries to the file
const writeProcessedEntries = (set) => {
  fs.writeFileSync(filePath, JSON.stringify(Array.from(set)), 'utf-8');
};

// Function to escape special characters in post titles
const escapeSpecialCharacters = (title) => {
  if (typeof title === 'undefined') {
    return '';
  }

  const specialCharacters = {
    '&amp;': '&',
    '&#124;': '|',
    '&#33;': '!',
    '&#63;': '?',
    '&#45;': '-',
    '&#43;': '+',
    '&#91;': '[',
    '&#93;': ']',
    '&#40;': '(',
    '&#41;': ')',
    '&#39;': "'",
    '&#8217;': "'",
    '&#8220;': '“',
    '&#8221;': '”',
    '&#8230;': '…',
    '&quot;': '"',
    '&#160;': ' ',
    '&#8208;': '-',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '‘',
    '&#8218;': '‚',
    '&#8222;': '„',
    '&#8249;': '‹',
    '&#8250;': '›',
    '&#34;': '"',
    '&#35;': '#',
    '&#37;': '%',
    '&#38;': '&',
    '&#39;': "'",
    '&#42;': '*',
    '&#43;': '+',
    '&#45;': '-',
    '&#47;': '/',
    '&#58;': ':',
    '&#59;': ';',
    '&#60;': '<',
    '&#62;': '>',
    '&#64;': '@',
    '&#91;': '[',
    '&#92;': '\\',
    '&#93;': ']',
    '&#94;': '^',
    '&#95;': '_',
    '&#96;': '`',
    '&#123;': '{',
    '&#124;': '|',
    '&#125;': '}',
    '&#126;': '~',
    '&#215;': '×',
    '&#247;': '÷',
    // Add more special characters and their entities as needed
  };

  // Replace HTML entities with special characters
  return title.replace(/&amp;|&#124;|&#33;|&#63;|&#45;|&#43;|&#91;|&#93;|&#40;|&#41;|&#39;|&#8217;|&#8220;|&#8221;|&#8230;|&quot;|&#160;|&#8208;|&#8211;|&#8212;|&#8216;|&#8218;|&#8222;|&#8249;|&#8250;|&#34;|&#35;|&#37;|&#38;|&#39;|&#42;|&#43;|&#45;|&#47;|&#58;|&#59;|&#60;|&#62;|&#64;|&#91;|&#92;|&#93;|&#94;|&#95;|&#96;|&#123;|&#124;|&#125;|&#126;|&#215;|&#247;/g, (match) => specialCharacters[match] || match);
};

// Set to store the processed entries
let processedEntries = readProcessedEntries();

// Function to execute the RSS feed check command
module.exports = async (client) => {
  const executeRssFeedCheckCommand = async () => {
    try {
      const parser = new Parser();
      const feed = await parser.parseURL(rssFeedURL);

      // Check if there are new items since the latest processed entry
      const newEntries = feed.items.filter(item => {
        const pubDate = new Date(item.pubDate);
        const pubDateString = pubDate.toISOString();
        const entryIdentifier = `${escapeSpecialCharacters(item.title)}-${pubDateString}`;

        if (processedEntries.has(entryIdentifier)) {
          console.log(`Entry already processed: ${escapeSpecialCharacters(item.title)}`);
          return false; // Entry already processed
        }

        return true; // New entry
      });

      // Sort new entries in ascending order based on the publication date
      newEntries.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));

      // Process new entries
      const embeds = [];
      newEntries.forEach(async (currentPost) => {
        const pubDate = new Date(currentPost.pubDate);

        // Check if the item is within the last 60 minutes
        const minutesAgo = differenceInMinutes(new Date(), pubDate);
        if (minutesAgo <= 60) {
          const title = escapeSpecialCharacters(currentPost.title) || 'Title not available';

          // Use the content:encoded tag for the comment
          let content = escapeSpecialCharacters(currentPost['content:encoded'] || 'Content not available').trim();

          // Remove "In reply to" and '&#8230;' from content
          content = content.replace(/In reply to.*?<\/p>/i, '').replace(/&#8230;|&#160;/g, '');

          // Remove <p> and </p> tags and handle line breaks
          content = content.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, '\n');

          const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(content)
            .setURL(currentPost.link)
            .setColor('#3498db')
            .setTimestamp(pubDate);

          embeds.push(embed);

          console.log('Embed added for new RSS feed item:', title);

          // Add the processed entry to the set
          const pubDateString = pubDate.toISOString();
          const entryIdentifier = `${title}-${pubDateString}`;
          processedEntries.add(entryIdentifier);
        }
      });

      // Send each embed separately
      for (const embed of embeds) {
        const guild = await client.guilds.fetch('691793566556487731').catch(console.error);
        const channel = await guild.channels.fetch('1260110806310453308').catch(console.error);

        await channel.send({
          embeds: [embed]
        });

        console.log('Embed sent successfully for new RSS feed item.');
      }

      // Write processed entries to the file
      writeProcessedEntries(processedEntries);

      // Explicitly log "No new entries found" message
      if (newEntries.length === 0) {
        console.log('No new entries found since the last check.');
      }
    } catch (error) {
      console.error('An error occurred while checking the RSS feed:', error);
      console.log(':x: An error occurred while checking the RSS feed.');
    }
  };

  // Schedule the command to run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('Running RSS feed check...');
    executeRssFeedCheckCommand();
  });
};
