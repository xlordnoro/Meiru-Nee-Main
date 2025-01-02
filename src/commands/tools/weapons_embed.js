//Define any of the required libraries or files to externally load/call for the command here.

const {
    MessageFlags,
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
      .setName("weapons_embed")
      .setDescription("A febal attempt to defend yourself from certain death."),
    async execute(interaction, client) {
      const { roles } = interaction.member;
      const role = await interaction.guild.roles
        .fetch("1070213452397826092")
        .catch(console.error);

//Cross-checks the fetch from earlier and if the user has the role, run the command. Otherwise, print a message to the user stating they lack the role required.
        
      if (roles.cache.has("1070213452397826092")) {
        const embed = new EmbedBuilder()
          .setTitle(`May the odds be ever in your favor`)
          .setDescription(
            `Please select from the following options to protect yourself in battle.`
          )
          .setColor('#3498db')

//Creates an array containing the buttons for the embed. The limit is 5/message and that's set by discord, not me.

        const buttons = new ActionRowBuilder().setComponents([
              new ButtonBuilder()
                .setCustomId("sword")
                .setLabel("Sword")
                .setStyle(ButtonStyle.Primary),
  
              new ButtonBuilder()
                .setCustomId("staff")
                .setLabel("Staff")
                .setStyle(ButtonStyle.Secondary),
  
              new ButtonBuilder()
                .setCustomId("bow")
                .setLabel("Bow")
                .setStyle(ButtonStyle.Success)
            ]
            );

//Sends a simple message to the user when the command is run correctly.
  
        await interaction.reply({
            content: `Message sent.`,
            flags: MessageFlags.Ephemeral,
        });

//Sends the output of the embed to a different channel and pings the role via their id. Otherwise, print they lack the role required to run the command.

        const channel = client.channels.cache.get('1070431762196471888');
        channel.send({content: `<@&1070214154926956584>`, allowedMentions: { roles: ['1070214154926956584'] }, embeds: [embed], components: [buttons]});

      } else {
        await interaction.reply({
          content: `You do not have the ${role.name} role.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    },
  };
  