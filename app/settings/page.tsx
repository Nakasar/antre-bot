import { REST, Routes, SlashCommandBuilder } from "discord.js";

export default function Home() {
  return (
    <div>
        <button onClick={async () => {
            'use server';

            console.log('Updating commands...');
            const commands = [];

            const deleteMessageCommands = new SlashCommandBuilder()
                .setName('clear')
                .setDescription('Clear messages in the channel')
                .setDescriptionLocalization('fr', 'Effacer les messages dans le canal')
                .addIntegerOption(option => 
                    option.setName('amount')
                        .setDescription('Number of messages to delete (max 100)')
                        .setDescriptionLocalization('fr', 'Nombre de messages à effacer (max 100)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)
                );
            commands.push(deleteMessageCommands.toJSON());
            

            const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID ?? ''),
                { body: commands }
            );

            console.log('Commands updated.');
        }}>Update commands</button>
    </div>
  );
}
