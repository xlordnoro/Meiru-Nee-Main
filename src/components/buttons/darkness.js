module.exports = {
    data: {
        name: `darkness`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `https://imgur.com/SJDLYp5.jpg/`,
            ephemeral: true
        });
    }
}