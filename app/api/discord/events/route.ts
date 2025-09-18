import { isValidRequest } from "discord-verify/node";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    console.debug(body);

    const isValid = await isValidRequest(req, process.env.DISCORD_PUBLIC_KEY ?? '');

    if (!isValid) {
        return NextResponse.json({ success: false }, { status: 403 });
    }

    if (body.type === 1) {
        return NextResponse.json({ type: 1 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}