const {
  MessageFlags,
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jailee")
    .setDescription("A one-way ticket to Hell.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Enter the username of the person you want to grant the Jailee role.")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user").setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const { roles } = interaction.member;
    const jaileeRoleId = "1070214154926956584";
    const adminRoleId = "691795495588200487";
    const announcementChannelId = "1070431762196471888";

    if (!roles.cache.has(adminRoleId)) {
      return interaction.reply({
        content: `You do not have the Admin role.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getMember("target");
    const jaileeRole = await interaction.guild.roles.fetch(jaileeRoleId).catch(console.error);

    if (!jaileeRole) {
      return interaction.reply({
        content: `Error: Jailee role not found.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const removableRoles = user.roles.cache.filter((role) => role.id !== interaction.guild.id);
    await user.roles.remove(removableRoles).catch(console.error);
    await user.roles.add(jaileeRole).catch(console.error);

    await interaction.editReply({
      content: `All roles removed and ${jaileeRole.name} role added to ${user}.`,
      flags: MessageFlags.Ephemeral,
    });

    const channel = client.channels.cache.get(announcementChannelId);
    if (channel) {
      channel.send({
        content: `@everyone ${user} has been volunteered for sadistic tribute!`,
      });
    }
  },
};
