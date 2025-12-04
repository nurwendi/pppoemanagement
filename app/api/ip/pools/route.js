import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function GET() {
    try {
        const client = await getMikrotikClient();
        const pools = await client.write('/ip/pool/print');
        return NextResponse.json(pools);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
