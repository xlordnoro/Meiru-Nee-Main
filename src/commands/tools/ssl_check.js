const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const tls = require('tls');
const { differenceInDays } = require('date-fns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sslcheck')
    .setDescription('Returns the SSL certificate status for a website.')
    .addStringOption(option =>
      option.setName('website')
        .setDescription('The URL of the website to check')
        .setRequired(true)),

  async execute(interaction, client) {
    const { roles } = interaction.member;

    // Fetch the guild to access roles and client
    const guild = await client.guilds.fetch(interaction.guildId).catch(console.error);

    // Cross-references if the user running the command has the developer role. Otherwise, state they lack the developer role.
    if (roles.cache.has("939318588605603850")) {
      try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const websiteURL = interaction.options.getString('website');
        const hostname = websiteURL.replace(/^https?:\/\//, ''); // Remove protocol

        const checkCertificate = async () => {
          return new Promise(async (resolve, reject) => {
            try {
              const socket = tls.connect(443, websiteURL, { rejectUnauthorized: false }, () => {
                const certificate = socket.getPeerCertificate(true);
                socket.end();
        
                if (certificate && Object.keys(certificate).length > 0) {
                  const expirationDateStr = certificate.valid_to; // Get the date string
                  const expirationDate = new Date(expirationDateStr);
        
                  if (!isNaN(expirationDate)) {
                    const daysRemaining = differenceInDays(expirationDate, new Date());
        
                    if (daysRemaining > 8 && daysRemaining < 14) {
                      resolve(`:warning: SSL certificate for ${websiteURL} will expire in ${daysRemaining} days.`);
                    } else if (daysRemaining < 7) {
                      resolve(`:warning: SSL certificate for ${websiteURL} will expire in ${daysRemaining} days. Please renew the SSL Certificate to prevent users from being antsy!`);
                    } else {
                      resolve(`:white_check_mark: SSL certificate for ${websiteURL} is valid and not expiring soon.`);
                    }
                  } else {
                    reject(':x: Unable to parse SSL certificate expiration date.');
                  }
                } else {
                  reject(':x: SSL certificate information is empty or incomplete.');
                }
              });
        
              socket.on('error', (error) => {
                reject(`:x: An error occurred while connecting to the server: ${error.message}`);
              });
            } catch (error) {
              reject(`:x: An unexpected error occurred: ${error.message}`);
            }
          });
        };        

        const result = await checkCertificate();
        await interaction.editReply({ content: result, flags: MessageFlags.Ephemeral });
      } catch (error) {
        console.error('An error occurred while checking the SSL certificate:', error);
        await interaction.editReply({ content: ':x: An error occurred while checking the SSL certificate.', flags: MessageFlags.Ephemeral });
      }
    } else {
      await interaction.reply({
        content: `You do not have the Ninja role.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};