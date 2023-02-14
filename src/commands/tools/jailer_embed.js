//Define any of the required libraries or files to externally load/call for the command here.

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    PermissionsBitField,
  } = require("discord.js");
  const darkness = require("../../components/buttons/darkness");
  const serious = require("../../components/buttons/serious");
  const changed_mind = require("../../components/buttons/changed_mind");
  const twisted = require("../../components/buttons/twisted");
  
//Creates the slash command and fetches the users role for verification 

  module.exports = {
    data: new SlashCommandBuilder()
      .setName("jailer_embed")
      .setDescription("A one-way ticket to hell explained in autistic detail."),
    async execute(interaction, client) {
      const { roles } = interaction.member;
      const role = await interaction.guild.roles
        .fetch("1070213452397826092")
        .catch(console.error);

//Cross-checks the fetch from earlier and if the user has the role, run the command. Otherwise, print a message to the user stating they lack the role required.
        
      if (roles.cache.has("1070213452397826092")) {
        const embed = new EmbedBuilder()
          .setTitle(`Thank You, Devil Boy, and Welcome to Hell!`)
          .setDescription(
            `So, you thought you were safe by ignoring all of my warnings, did you? Well, I guess I shouldn't be surprised after being raised in a hell-hole kinda place like this for the last eighteen years of your life. Unfortunately, there will be no heroic escape, nor will you be saving any princesses in here. \n\nDepending on your reading speed, and if you have a functioning pair of eyes and a brain, you might be able to escape from here as I know about a  hidden path that the admins don't... Below are three choices, Devil Boy. Choose correctly and you'll find yourself on the other side of the gate to Hell. Choose incorrectly *heehee and I guess we'll be spending a lot of time together, Devil Boy.`
          )
          .setColor(14554646)

//Creates an array containing the buttons for the embed. The limit is 5/message and that's set by discord, not me.

        const buttons = new ActionRowBuilder().setComponents([
              new ButtonBuilder()
                .setCustomId("darkness")
                .setLabel("I'm not afraid of the darkness.")
                .setStyle(ButtonStyle.Secondary),
  
              new ButtonBuilder()
                .setCustomId("serious")
                .setLabel("Serious Time!!!!")
                .setStyle(ButtonStyle.Secondary),
  
              new ButtonBuilder()
                .setCustomId("changed_mind")
                .setLabel("Okay, I've changed my ways.")
                .setStyle(ButtonStyle.Secondary),
  
              new ButtonBuilder()
                .setCustomId("twisted")
                .setLabel("Really, I give up! Just make it stop already!")
                .setStyle(ButtonStyle.Danger)
            ]
            );

//Sends a simple message to the user when the command is run correctly.
  
        await interaction.reply({
            content: `Message sent.`,
            ephemeral: true,
        });

//Sends the output of the embed to a different channel and pings the role via their id. Otherwise, print they lack the role required to run the command.

        const channel = client.channels.cache.get('1070217991360364604');
        channel.send({content: `<@&1070214154926956584>`, allowedMentions: { roles: ['1070214154926956584'] }, embeds: [embed], components: [buttons]});

      } else {
        await interaction.reply({
          content: `You do not have the ${role.name} role.`,
        });
      }
    },
  };
  