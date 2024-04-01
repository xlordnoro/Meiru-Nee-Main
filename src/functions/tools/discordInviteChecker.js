const Discord = require('discord.js');

// Array of admin role IDs
const adminRoleIds = ['1074229659119661058', '691795495588200487', '234659298024620042'];

module.exports = async (client) => {
    client.on('messageCreate', async message => {
        try {
            // Check if message is defined and not null
            if (!message) {
                console.error('Message is null or undefined.');
                return;
            }

            // Ignore messages from bots
            if (message.author.bot) {
                return;
            }

            // Check if the message contains an invite link
            if (message.content.match(/discord.gg\/\w+/i)) {
                console.log('Invite link detected:', message.content);

                // Check if the author of the message is an admin
                const member = message.member;
                if (!member) {
                    console.error('Member is null or undefined.');
                    return;
                }

                // Check if the member has any of the admin roles
                const isAdmin = adminRoleIds.some(roleId => member.roles.cache.has(roleId));

                if (!isAdmin) {
                    // Inform the user that they need admin approval
                    await message.reply('You do not have permission to post invite links. Please contact an admin for approval.');

                    // Delete the message containing the invite link
                    await message.delete();
                    console.log('Deleted message containing unauthorized invite link.');
                } else {
                    console.log('User has admin role.');
                }
            }
        } catch (error) {
            console.error('Error in handleInviteLinks:', error);
        }
    });
};