//Loads the required libraries or files to externally load for the command.

const { MessageFlags, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

//Create slash command and display a message containing all of the commands available for Mieru-Nee-Main presently.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Shows a list of the available commands for Mieru-Nee-Main."
    ),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle(`Available Commands`)
      .setDescription(
        `**Normal Commands:**\n\n **/help** Displays the command list.\n\n **/ping** Displays the ping latency between the API and the user.\n\n **Mod commands:**\n\n **/database** Allows mods to add information to the database (Requires the ninja role).\n\n **/jailee** Allows mods to grant troublesome users the jailee role before they're banned (Requires admin role.)\n\n **/jailer_embed** Creates an embed for a hidden channel in the server (Requires the Jailer role).\n\n **/roles_embed** Creates an embed in the roles channel (Requires the admin role).\n\n **/sslcheck** Allows mods to check the ssl certificate of any given website of their choosing (requires the ninja role).\n\n **/weapons_embed** Creates an embed for a hidden channel in the server (Requires the Jailer role).`
      )
      .setColor('#3498db');

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
