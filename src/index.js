import { Client, GatewayIntentBits, Collection, MessageFlags } from 'discord.js';
import cron from 'node-cron';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import 'dotenv/config';
import { initDatabase } from './database/init.js';
import { config } from './config.js';
import { checkForNewActivity } from './services/activity.js';
import { closeBrowser } from './utils/scraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  const files = await readdir(commandsPath);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const command = await import(pathToFileURL(join(commandsPath, file)).href);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${file} is missing required properties.`);
    }
  }
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);

  cron.schedule(`*/${config.polling.intervalMinutes} * * * *`, () => {
    checkForNewActivity(client);
  });

  console.log(`Activity polling scheduled every ${config.polling.intervalMinutes} minutes.`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    
    const errorMessage = {
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

async function main() {
  if (!config.discord.token) {
    console.error('Error: DISCORD_TOKEN must be set in .env');
    process.exit(1);
  }

  console.log('Initializing database...');
  await initDatabase();
  console.log('Database initialized.');

  await loadCommands();
  console.log(`Loaded ${client.commands.size} commands.`);

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closeBrowser();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await closeBrowser();
    process.exit(0);
  });

  await client.login(config.discord.token);
}

main().catch(console.error);
