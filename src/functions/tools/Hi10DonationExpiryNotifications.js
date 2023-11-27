const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
  try {
    const axios = require('axios');
    const cron = require("node-cron");
    require('dotenv').config();

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const channelId = process.env.CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    // Array to store users who haven't expired
    const validUsers = [];

    async function accessGoogleSheets() {
      try {
        // Make a request to the Google Sheets API using your API key
        const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${process.env.GOOGLE_SHEETS_API_KEY}`);

        if (response.status === 200) {
          const sheets = response.data.sheets;
          console.log('Google sheet accessed successfully...');

          // Iterate through all sheets in the workbook
          for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
            // Skip processing the first sheet
            if (sheetIndex === 0) {
              continue;
            }

            const sheet = sheets[sheetIndex];
            const sheetTitle = sheet.properties.title;
            const range = `${sheetTitle}!A:Z`; // Adjust the range as needed

            const valuesResponse = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`);

            if (valuesResponse.status === 200) {
              const rows = valuesResponse.data.values;

              // Assuming the first row contains headers and data starts from the second row
              for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // Assuming the titles to ignore are in the same row
                const titlesToIgnore = row.map(title => title && title.toLowerCase());

                if (titlesToIgnore.some(title =>
                  title.includes('date') ||
                  title.includes('user') ||
                  title.includes('amount received') ||
                  title.includes('elevated status until the following day') ||
                  title.includes('payment method')
                )) {
                  // Ignore this row since it contains titles to be ignored
                  continue;
                }

                const userId = row[1];      // Assuming the user ID is in the second column
                const expiryDate = row[3];  // Assuming the expiry date is in the fourth column

                // Check if the expiryDate is not a valid date or contains certain keywords
                if (userId && expiryDate) {
                  if (
                    isNaN(Date.parse(expiryDate)) ||
                    expiryDate.toLowerCase().includes('returned') ||
                    expiryDate.toLowerCase().includes('subscriber') ||
                    expiryDate.toLowerCase().includes('n/a') ||
                    expiryDate.toLowerCase().includes('extended')
                  ) {
                    // Skip processing this row
                    continue;
                  }

                  const expirationDate = new Date(expiryDate); // Convert the expiration date to a Date object

                  // Check if the expiration date is the current date
                  const daysUntilExpiration = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
                  if (daysUntilExpiration <= 0) {
                    // Expiry date is the current date (send reminder)
                    await sendReminderEmbed(userId, expiryDate);
                  } else {
                    // User hasn't expired, add to the validUsers array
                    validUsers.push({ userId, expiryDate });
                  }
                }
              }
            } else {
              console.error(`Error accessing values for sheet ${sheetTitle}. Status Code: ${valuesResponse.status}`);
            }
          }
        } else {
          console.error(`Error accessing Google Sheets workbook. Status Code: ${response.status}`);
        }
      } catch (error) {
        console.error('Error in the script:', error.message);
      }
    }

    async function sendReminderEmbed(userId, expiryDate) {
      const guild = await client.guilds.fetch(guildId).catch(console.error);
      if (!guild) return;

      const channel = await guild.channels.fetch(channelId).catch(console.error);
      if (channel) {
        const liveEmbed = new EmbedBuilder()
          .setTitle('Hi10 Donation Expiry Reminder')
          .setDescription(`Username: ${userId}\nExpiry Date: ${expiryDate}`)
          .setColor('#3498db'); // You can customize the color

        await channel.send({ content: '<@&1053914574631477268>', embeds: [liveEmbed], allowedMentions: { roles: ['1053914574631477268'] }})
          .then(() => {
            console.log('Hi10 donation expiry reminder message sent successfully.');
          })
          .catch((error) => {
            console.error('Error sending Hi10 donation expiry reminder message:', error.message);
          });
      }
    }

    // Schedule the checkLiveStatus function to run daily at 7 a.m.
    cron.schedule("0 7 * * *", () => {
      accessGoogleSheets();
    });

  } catch (error) {
    console.error('Error in the script:', error.message);
  }
};
