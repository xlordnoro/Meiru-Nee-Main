const Discord = require('discord.js');
const nodemailer = require('nodemailer');
const cron = require('node-cron'); // For scheduling tasks
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email user
        pass: process.env.EMAIL_PASS // Use environment variable for email password
    }
});

// The ID of the admin role that can approve invite links
const adminRoleIds = ['1074229659119661058', '691795495588200487', '234659298024620042'];

// File path to store processed entries
const filePath = path.join(__dirname, '../../json/processedDiscordInvites.json');

// Function to send email notification with the contents of the JSON file
async function sendEmailNotification() {
    try {
        // Read the contents of the JSON file
        let jsonData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            if (fileContent.trim() !== '') {
                jsonData = JSON.parse(fileContent);
            }
        }

        // Check if there are any entries in the JSON file
        if (jsonData.length === 0) {
            console.log('No unauthorized invite links detected. Skipping email notification.');
            return;
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Unauthorized Invite Links Posted',
            text: jsonData.join('\n')
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent successfully.');

        // Clear the JSON file after sending email
        fs.writeFileSync(filePath, '[]');
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

module.exports = async (client) => {
    // Listen for message events
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
            if (message.content.match(/(discord\.gg\/\w+)|(steamcommunity\.com\/gift\/)|(https:\/\/discordgift\.site\/)|(steamcommunity\.com\/gift-card\/pay)|(@everyone)/i))
                {
                // Check if the author of the message is an admin
                const member = message.member;
                if (!member) {
                    console.error('Member is null or undefined.');
                    return;
                }

                const isAdmin = member.roles.cache.some(role => adminRoleIds.includes(role.id));

                if (!isAdmin) {
                    // Inform the user that they need admin approval
                    const reply = await message.reply('You do not have permission to post invite links. Please contact an admin for approval.');
                    await message.delete();
                    console.log('Deleted message containing unauthorized invite link.');

                    // Delete the message containing the invite link after 5 seconds
                    setTimeout(async () => {
                        await reply.delete();
                    }, 5000);

                    console.log('Deleting the reply message now.');

                    // Append the response message to the JSON file
                    let jsonData = [];
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        if (fileContent.trim() !== '') {
                            jsonData = JSON.parse(fileContent);
                        }
                    }
                    jsonData.push(`${message.author.tag} posted an unauthorized invite link on Discord: ${message.content}`);
                    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));
                } else {
                    console.log('User has admin role.');
                }
            }
        } catch (error) {
            console.error('Error in handleInviteLinks:', error);
        }
    });

    // Schedule the email sending to occur daily at 7 a.m.
    cron.schedule('0 7 * * *', async () => {
        await sendEmailNotification();
    });
};