module.exports = {
  data: {
    name: `otaku_role`,
  },

//Checks if user already has the role. Otherwise, remove the role specified by the id.

  async execute(interaction, client) {
    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("974160193426456576")
      .catch(console.error);

    if (roles.cache.has("974160193426456576")) {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: true,
      });

      await roles.remove(role).catch(console.error);
      await interaction.editReply({
        content: `Removed: ${role.name} role from your profile.`,
        ephemeral: true,
      });
    } else {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: true,
      });
      await roles.add(role).catch(console.error);
      await interaction.editReply({
        content: `Added: ${role.name} role to your profile.`,
        ephemeral: true,
      });
    }
  },
};
