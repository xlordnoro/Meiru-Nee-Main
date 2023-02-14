module.exports = {
    data: {
        name: `changed_mind`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `https://imgur.com/UBCKG2K.jpg`,
            ephemeral: true
        });
    }
}