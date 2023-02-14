module.exports = {
    data: {
        name: `twisted`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `My master really is a twisted individual, right?`,
            ephemeral: true
        });
    }
}