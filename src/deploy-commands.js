import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { initDatabase } from './database/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getCommands() {
  const commands = [];
  const commandsPath = join(__dirname, 'commands');
  const files = await readdir(commandsPath);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const { data } = await import(pathToFileURL(join(commandsPath, file)).href);
    commands.push(data.toJSON());
  }

  return commands;
}

async function deployCommands() {
  if (!config.discord.token || !config.discord.clientId) {
    console.error('Error: DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env');
    process.exit(1);
  }

  await initDatabase();

  const commands = await getCommands();
  console.log(`Found ${commands.length} commands to register.`);

  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
}

deployCommands();
