module.exports = {
    data: {
        name: `sword`
    },
    async execute(interaction, client) {
        const options = ["You slice open your thumb while trying to grab the hilt of the sword and lose 2600hp as a result of your plunder.", "The sword breaks after one swing, leaving you defenseless against your enemy as it bares its fang against your battered body.", "You look upward and gaze deeply at your weapon, only to realize its just a children's toy."]
        const randomResponse = options[Math.floor(Math.random() * options.length)];
        await interaction.reply({
            content: (randomResponse),
            ephemeral: true
        });
    }
}