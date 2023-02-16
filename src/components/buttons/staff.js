module.exports = {
    data: {
        name: `staff`
    },
    async execute(interaction, client) {
        const options = ["You lose control of your magical powers and end up whacking yourself in the head with the staff.", "Upon closer insepction, you realize that your staff is just an ordinary stick with no magical powers.", "You push too much mana into your staff and it blows up in your face in spectacular fashion."]
        const randomResponse = options[Math.floor(Math.random() * options.length)];
        await interaction.reply({
            content: (randomResponse),
            ephemeral: true
        });
    }
}