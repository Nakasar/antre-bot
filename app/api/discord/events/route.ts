import { verify } from "discord-verify/node";
import { NextResponse } from "next/server";
import crypto from 'node:crypto'; 

export async function POST(req: Request) {
    const body = await req.json();

    const signature = req.headers.get("x-signature-ed25519");
	const timestamp = req.headers.get("x-signature-timestamp");
	const rawBody = JSON.stringify(body);

    const isValid = await verify(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY ?? '', crypto.webcrypto.subtle);

    
    if (!isValid) {
        return NextResponse.json({ success: false }, { status: 403 });
    }

    console.debug(body);

    if (body.type === 1) {
        return NextResponse.json({ type: 1 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}