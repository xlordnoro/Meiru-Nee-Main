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
        const expirationDate = parse(expirationDateStr, 'MMM dd HH:mm:ss yyyy \'GMT\'', new Date());

        if (!isNaN(expirationDate)) {
          const daysRemaining = differenceInDays(expirationDate, new Date());

          const guild = await client.guilds.fetch('691793566556487731').catch(console.error);
          if (!guild) {
            console.error(`:x: The specified guild (${guild}) is not found.`);
            return;
          }

          const channel = await guild.channels.fetch('1132585873402253322').catch(console.error);
          if (!channel) {
            console.error(`:x: The specified channel (${channel}) is not found.`);
            return;
          }

          // Send the embed to the specified channel if daysRemaining <= 7
          if (daysRemaining <= 7) {
            // Prepare the embed for the SSL check result
            const embed = new EmbedBuilder()
              .setTitle('SSL Certificate Status')
              .setDescription(`:warning: SSL certificate for ${websiteURL} will expire in ${daysRemaining} days.`)
              .setColor('#FF0000');

            // Send the embed with a mention to a role
            await channel.send({ embeds: [embed], content: '<@&939318588605603850>', allowedMentions: { roles: ['939318588605603850'] } });
            console.log('Embed sent successfully!');
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