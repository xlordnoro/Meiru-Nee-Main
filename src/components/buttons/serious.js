module.exports = {
    data: {
        name: `serious`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: "https://www.youtube.com/watch?v=bau3E9FPu3Y",
            ephemeral: true
        });
    }
}