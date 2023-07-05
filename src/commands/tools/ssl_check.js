const { PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const https = require('https');
const { parseISO, differenceInDays } = require('date-fns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sslcheck')
    .setDescription('Returns the expiry date of the SSL certificate for a website.')
    .addStringOption(option =>
      option.setName('website')
        .setDescription('The URL of the website to check')
        .setRequired(true)),

  async execute(interaction, client) {

    //fetches the ninja role ID to be used later in the command.

    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("939318588605603850")
      .catch(console.error);

    //cross-references if the user running the command has the ninja role. Otherwise, state they lack the ninja role.

    if (roles.cache.has("939318588605603850")) {
    try {
      const websiteURL = interaction.options.getString('website');
      const req = https.request(websiteURL, (res) => {
        const certificate = res.socket.getPeerCertificate();
        const expirationDate = parseISO(certificate.valid_to);

        if (expirationDate) {
          const daysRemaining = differenceInDays(expirationDate, new Date());
          if (daysRemaining <= 7) {
            const expirationString = expirationDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            interaction.reply({
              content: `:warning: SSL certificate for ${websiteURL} will expire on ${expirationString} (${daysRemaining} days remaining).`,
              ephemeral: true, // Only visible to the user who triggered the command
            });
          } else {
            interaction.reply({
              content: `:white_check_mark: SSL certificate for ${websiteURL} is valid and not expiring soon.`,
              ephemeral: true, // Only visible to the user who triggered the command
            });
          }
        } else {
          interaction.reply({
            content: ':x: Unable to retrieve SSL certificate information.',
            ephemeral: true, // Only visible to the user who triggered the command
          });
        }
      });

      req.on('error', (error) => {
        console.error('An error occurred while checking the SSL certificate:', error);
        interaction.reply({
          content: ':x: The SSL certificate for the website has already expired.',
          ephemeral: true, // Only visible to the user who triggered the command
        });
      });

      req.end();
    } catch (error) {
      console.error('An error occurred while checking the SSL certificate:', error);
      interaction.reply({
        content: ':x: An error occurred while checking the SSL certificate.',
        ephemeral: true, // Only visible to the user who triggered the command
      });
    }
  } else {
    await interaction.reply({
      content: `You do not have the Ninja role.`,
      ephemeral: true,
    });
  }
  },
};