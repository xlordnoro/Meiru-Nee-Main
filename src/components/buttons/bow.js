module.exports = {
    data: {
        name: `bow`
    },
    async execute(interaction, client) {
        const options = ["While pulling back the bowstring, it snaps and you lose your right-eye as result of your plunder.", "While trying to light a fire with your bow, you end up lighting yourself on fire instead.", "They say that if you pull your bow back at the right angle, you can find the hidden path to El Dorado."]
        const randomResponse = options[Math.floor(Math.random() * options.length)];
        await interaction.reply({
            content: (randomResponse),
            ephemeral: true
        });
    }
}