//Define any of the required libraries or files to externally load/call for the command here.

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles_embed")
    .setDescription("Creates roles embed."),
  async execute(interaction, client) {
    const { roles } = interaction.member;
      const role = await interaction.guild.roles
        .fetch("691795495588200487")
        .catch(console.error);

//Cross-checks the fetch from earlier and if the user has the role, run the command. Otherwise, print a message to the user stating they lack the role required.
    if (roles.cache.has("691795495588200487")) {
    const embed = new EmbedBuilder()
      .setTitle(`Roles`)
      .setDescription(`Please click the buttons below to grant yourself the required roles to view the other channels on the server.`)
      .setColor(14554646)

//Create buttons to grant users the gamer or otaku role.

    const buttons = new ActionRowBuilder().setComponents([
      new ButtonBuilder()
        .setCustomId("gamer_role")
        .setLabel("Gamer")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("otaku_role")
        .setLabel("Otaku")
        .setStyle(ButtonStyle.Success),
    ]);

    await interaction.reply({
      content: `Message sent.`,
      ephemeral: true,
    });

    const channel = client.channels.cache.get('1070209334698590239');
    channel.send({content: `@everyone`, embeds: [embed], components: [buttons]});
  } else {
    await interaction.reply({
      content: `You do not have the ${role.name} role.`,
    });
  }
}
};