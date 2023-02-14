//Define any of the required libraries or files to externally load/call for the command here.

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");

//Creates the slash command and adds a required user subcommand argument to grant the jailee role.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jailee")
    .setDescription("A one-way ticket to Hell.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription(
          "Enter the username of the person you want to grant the Jailee role."
        )
        .addUserOption((option) =>
          option.setName("target").setDescription("The user").setRequired(true)
        )
    ),

  //Fetches the jailee role that will be called later in the command.

  async execute(interaction, client) {
    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("1070214154926956584")
      .catch(console.error);

    //Cross-checks if the user has the admin role. If true, run the command. Otherwise, print a message to the user stating they lack the admin role.

    if (roles.cache.has("691795495588200487")) {
      const user = interaction.options.getMember("target");

      //Checks if the user has the jailee role. If true, print a message to the user stating they have the role. Otherwise, add the jailee role to the specified user.

      if (user.roles.cache.has("1070214154926956584")) {
        await interaction.deferReply({
          fetchReply: true,
          ephemeral: true,
        });

        await interaction.editReply({
          content: `You already have the ${role.name} role.`,
          ephemeral: true,
        });
      } else {
        await interaction.deferReply({
          fetchReply: true,
          ephemeral: true,
        });

        await user.roles.add(role, user).catch(console.error);
        await interaction.editReply({
          content: `Added: ${role.name} role to ${user}.`,
          ephemeral: true,
        });

        //Direct the command output to the specified channel via their id ie. #Colosseum

        const channel = client.channels.cache.get("1070431762196471888");
        channel.send({
          content: `@everyone ${user} has been volunteered for sadistic tribute!`,
        });
      }
    } else {
      await interaction.reply({
        content: `You do not have the Admin role.`,
        ephemeral: true,
      });
    }
  },
};
