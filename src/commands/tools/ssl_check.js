const { SlashCommandBuilder } = require('discord.js');
const tls = require('tls');
const { parse, differenceInDays } = require('date-fns');

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
        await interaction.deferReply({ ephemeral: true });

        const websiteURL = interaction.options.getString('website');

        const checkCertificate = async () => {
          return new Promise(async (resolve, reject) => {
            const socket = tls.connect(443, websiteURL, { rejectUnauthorized: false }, () => {
              const certificate = socket.getPeerCertificate(true);
              socket.end();

              if (certificate && Object.keys(certificate).length > 0) {
                const expirationDateStr = certificate.valid_to; // Get the date string
                const expirationDate = parse(expirationDateStr, 'MMM d HH:mm:ss yyyy \'GMT\'', new Date());

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
          });
        };

        const result = await checkCertificate();
        await interaction.editReply({ content: result, ephemeral: true });
      } catch (error) {
        console.error('An error occurred while checking the SSL certificate:', error);
        await interaction.editReply({ content: ':x: An error occurred while checking the SSL certificate.', ephemeral: true });
      }
    } else {
      await interaction.reply({
        content: `You do not have the Developer role.`,
        ephemeral: true,
      });
    }
  },
};