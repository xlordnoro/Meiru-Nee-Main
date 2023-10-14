const https = require('https');
const { parse, format, differenceInDays } = require('date-fns');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');

// Replace with your website URL
const websiteURL = 'https://hi10anime.com';

// Function to execute the SSL check command
module.exports = async (client) => {
  const executeSslCheckCommand = async () => {
    try {
      const req = https.request(websiteURL, async (res) => {
        const certificate = res.socket.getPeerCertificate();
        const expirationDateStr = certificate.valid_to; // Get the date string
        console.log('Certificate Data:', certificate);

        // Convert the date string to a JavaScript Date object
        const formattedDateStr = expirationDateStr.replace(/\s+/g, ' '); // Remove extra spaces
        const expirationDate = parse(formattedDateStr, 'MMM d HH:mm:ss yyyy \'GMT\'', new Date());

        if (!isNaN(expirationDate)) {
          const daysRemaining = differenceInDays(expirationDate, new Date());

          const guild = await client.guilds.fetch('155549815466491904').catch(console.error);
          if (!guild) {
            console.error(`:x: The specified guild (${guild}) is not found.`);
            return;
          }

          const channel = await guild.channels.fetch('1158250113941114901').catch(console.error);
          if (!channel) {
            console.error(`:x: The specified channel (${channel}) is not found.`);
            return;
          }

          if (daysRemaining > 8 && daysRemaining < 14) {
            // Prepare the embed for the "8 to 14 days" condition
            const embed = new EmbedBuilder()
              .setTitle('SSL Certificate Status')
              .setDescription(`:warning: SSL certificate for ${websiteURL} will expire in ${daysRemaining} days.`)
              .setColor('#FF0000');

            // Send the embed with mentions to multiple roles as a single string with spaces
            await channel.send({
              embeds: [embed],
              content: '<@&320836865047527426> <@&1053914574631477268>',
              allowedMentions: { roles: ['320836865047527426', '1053914574631477268'] },
            });
            console.log('Embed sent successfully for 8 to 14 days condition!');
          } else if (daysRemaining < 7) {
            // Prepare the embed for the "less than 7 days" condition
            const embed2 = new EmbedBuilder()
              .setTitle('SSL Certificate Status')
              .setDescription(`:warning: SSL certificate for ${websiteURL} will expire in ${daysRemaining} days. Please renew the SSL Certificate to prevent users from being antsy!`)
              .setColor('#FF0000');

            // Send the embed with mentions to multiple roles as a single string with spaces
            await channel.send({
              embeds: [embed2],
              content: '<@&320836865047527426> <@&1053914574631477268>',
              allowedMentions: { roles: ['320836865047527426', '1053914574631477268'] },
            });
            console.log('Embed sent successfully for less than 7 days condition!');
          } else {
            console.log(`:white_check_mark: SSL certificate for ${websiteURL} is valid and not expiring soon.`);
          }
        } else {
          console.error(':x: Unable to retrieve SSL certificate information or parse the date.');
        }
      });

      req.on('error', (error) => {
        console.error('An error occurred while checking the SSL certificate:', error);
        console.log(':x: The SSL certificate for the website has already expired.');
      });

      req.end();
    } catch (error) {
      console.error('An error occurred while checking the SSL certificate:', error);
      console.log(':x: An error occurred while checking the SSL certificate.');
    }
  };

  // Schedule the command to run daily at 7:00 a.m.
  cron.schedule('0 7 * * *', () => {
    console.log('Running SSL certificate check...');
    executeSslCheckCommand();
  });
};