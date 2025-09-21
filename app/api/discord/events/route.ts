import { REST } from "@discordjs/rest";
import { APIApplicationCommand, APIApplicationCommandInteraction, APIMessageApplicationCommandInteraction, ApplicationCommandType, InteractionType, Routes, WebhookType } from "discord-api-types/v10";
import { verify } from "discord-verify/node";
import { NextResponse } from "next/server";
import crypto from 'node:crypto'; 

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN ?? '');

export async function POST(req: Request) {
    const body = await req.json();

    const signature = req.headers.get("x-signature-ed25519");
	const timestamp = req.headers.get("x-signature-timestamp");
	const rawBody = JSON.stringify(body);

    console.debug(body);

    const isValid = await verify(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY ?? '', crypto.webcrypto.subtle);
    
    if (!isValid) {
        console.warn('Invalid request signature');
        return NextResponse.json({ success: false }, { status: 403 });
    }

    if (body.type === 1) {
        return NextResponse.json({ type: 1 });
    } else if (body.type === InteractionType.ApplicationCommand) {
        return handleApplicationCommand(body);
    }

    return NextResponse.json({ success: true }, { status: 200 });
}


async function handleApplicationCommand(body: APIMessageApplicationCommandInteraction) {
    if (body.data.name === 'Clear after') {
        return handleClearAfterCommand(body);
    }
}

async function handleClearAfterCommand(interaction: APIMessageApplicationCommandInteraction) {
    const query = new URLSearchParams();
    query.set('after', interaction.data.target_id);

    const messages = await rest.get(Routes.channelMessages(interaction.channel.id), {
        query,
    });

    console.log(messages);

    return NextResponse.json({ success: true }, { status: 200 });
}
