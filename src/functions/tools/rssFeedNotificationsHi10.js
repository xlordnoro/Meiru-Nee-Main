const fs = require('fs');
const path = require('path');
const https = require('https');
const cron = require('node-cron');
const { parse, differenceInMinutes } = require('date-fns');
const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');

// Replace with your RSS feed URL
const rssFeedURL = 'https://hi10anime.com/feed/atom';

// Replace with the icon URL
const iconURL = 'https://images-ext-1.discordapp.net/external/tfjokmvbiCUQ1H5JDeFnVAyNcoO5kAi3jCW0FLEQ8hA/https/ub3r-b0t.com/img/rss.png';

// File path to store processed entries
const filePath = path.join(__dirname, 'processedEntries_hi10.json');

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
  const specialCharacters = {
    '&amp;': '&',
    '&#124;': '|',
    '&#33;': '!',
    '&#63;': '?',
    '&#45;': '-',
    '&#91;': '[',
    '&#93;': ']',
    '&#40;': '(',
    '&#41;': ')',
    // Add more special characters and their entities as needed
  };

  // Replace HTML entities with special characters
  return title.replace(/&amp;|&#124;|&#33;|&#63;|&#45;|&#91;|&#93;|&#40;|&#41;/g, (match) => specialCharacters[match] || match);
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

      // Process new entries
      const embeds = [];
      newEntries.forEach(async (currentPost) => {
        const pubDate = new Date(currentPost.pubDate);

        // Check if the item is within the last 60 minutes
        const minutesAgo = differenceInMinutes(new Date(), pubDate);
        if (minutesAgo <= 60) {
          const author = currentPost['dc:creator'] || currentPost.author || 'Unknown Author';
          const cleanedDescription = currentPost.contentSnippet.replace(/\n+/g, '\n').trim();
          const title = escapeSpecialCharacters(currentPost.title) || 'Title not available';

          const embed = new EmbedBuilder()
            .setAuthor({ name: author, iconURL })
            .setTitle(title)
            .setDescription(cleanedDescription)
            .setURL(currentPost.link)
            .setColor('#3498db')
            .setTimestamp();

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
        const guild = await client.guilds.fetch('155549815466491904').catch(console.error);
        const channel = await guild.channels.fetch('1195464938630684762').catch(console.error);

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