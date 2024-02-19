const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const deployCommands = require('./deploy-command.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.cooldowns = new Collection();

client.commands = new Collection();

client.on('guildCreate', guild => {
    // Adicionando o guildId ao config.json
    addGuildIdToConfig(guild.id);
});

client.on('guildCreate', guild => {
    console.log(`Bot was added to ${guild.name} (${guild.id})`);
    // Deploy commands when bot is added to a guild
    deployCommands(guild.id);
});

function addGuildIdToConfig(guildId) {
    try {
        const config = require('./config.json');
        config.guildId = guildId;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        console.log('GuildId adicionado ao config.json:', guildId);
    } catch (error) {
        console.error('Erro ao adicionar guildId ao config.json:', error);
    }
}

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);