import { REST } from "@discordjs/rest";
import { APIMessage, APIMessageApplicationCommandInteraction, InteractionType, Routes } from "discord-api-types/v10";
import { verify } from "discord-verify/node";
import { NextResponse } from "next/server";
import crypto from 'node:crypto'; 

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN ?? '');

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
    }) as APIMessage[];

    if (messages.length === 0) {
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    content: 'Aucun message à supprimer après celui-ci.',
                    flags: 64, // Ephemeral
                },
            },
        });
    } else if (messages.length === 1) {
        await rest.delete(Routes.channelMessage(interaction.channel.id, messages[0].id), {
            headers: {
                'X-Audit-Log-Reason': `Clear after command used by ${interaction.member?.user.username || interaction.user?.username}`
            }
        });

        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    content: '1 message supprimé.',
                    flags: 64, // Ephemeral
                },
            },
        });
    } else {
        const deleteChunks = [];
        for (let i = 0; i < messages.length; i += 100) {
            deleteChunks.push(messages.slice(i, i + 100));
        }
        
        for (const chunk of deleteChunks) {
            await rest.post(Routes.channelBulkDelete(interaction.channel.id), {
                body: {
                    messages: chunk.map(m => m.id),
                },
                headers: {
                    'X-Audit-Log-Reason': `Clear after command used by ${interaction.member?.user.username || interaction.user?.username}`
                },
            });
        }

        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    content: `${messages.length} messages supprimés.`,
                    flags: 64, // Ephemeral
                },
            },
        });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
