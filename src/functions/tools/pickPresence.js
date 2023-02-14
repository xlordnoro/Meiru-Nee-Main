//Loads the required modules

const { ActivityType } = require("discord.js");

//Creates an array containing the various statuses to display

module.exports = (client) => {
  client.pickPresence = async () => {
    const options = [
      {
        type: ActivityType.Watching,
        text: "Over Diene. Ah... Why must we be separated for so long my dear little sister...?",
        status: "online",
      },
      {
        type: ActivityType.Listening,
        text: "A raging masochistic elf queen who won't take no for an answer",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "With Diene and Miledi",
        status: "online",
      },
    ];

//Uses a math.random function to determine which option to pick for the day and sets the presence.

    const option = Math.floor(Math.random() * options.length);

    client.user.setPresence({
      activities: [
        {
          name: options[option].text,
          type: options[option].type,
        },
      ],
      status: options[option].status,
    });
  };
};
