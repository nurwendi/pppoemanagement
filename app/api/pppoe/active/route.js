import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function GET() {
    try {
        const client = await getMikrotikClient();

        // Fetch active PPPoE connections
        const activeConnections = await client.write('/ppp/active/print');

        return NextResponse.json(activeConnections);
    } catch (error) {
        console.error('Error fetching active connections:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
