'use server';

import { REST } from "@discordjs/rest";
import { Routes, ApplicationCommandType } from 'discord-api-types/v10';
import { SlashCommandBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';

export async function registerDiscordCommands() {
    console.log('Updating commands...');
    const commands = [
    new ContextMenuCommandBuilder()
        .setName('Clear after')
        .setNameLocalization('fr', 'Nettoyer après')
        .setType(ApplicationCommandType.Message)
        .toJSON()
    ];

    const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID ?? ''),
        { body: commands }
    );

    console.log('Commands updated.');
}
