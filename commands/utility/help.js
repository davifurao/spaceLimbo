const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('information about the commands bot'),
	async execute(interaction) {
		await interaction.reply({content: 'Here are the commands you can use:', ephemeral: true});
        
	},
};