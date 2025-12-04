import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function GET() {
    try {
        const client = await getMikrotikClient();
        const profiles = await client.write('/ppp/profile/print');

        // Parse price from comment
        const profilesWithPrice = profiles.map(p => {
            let price = '';
            if (p.comment && p.comment.includes('price:')) {
                const match = p.comment.match(/price:(\d+)/);
                if (match) price = match[1];
            }
            return { ...p, price };
        });

        return NextResponse.json(profilesWithPrice);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const client = await getMikrotikClient();
        const { name, localAddress, remoteAddress, rateLimit, price } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const addParams = [`=name=${name}`];
        if (localAddress) addParams.push(`=local-address=${localAddress}`);
        if (remoteAddress) addParams.push(`=remote-address=${remoteAddress}`);
        if (rateLimit) addParams.push(`=rate-limit=${rateLimit}`);
        if (price) addParams.push(`=comment=price:${price}`);

        const result = await client.write('/ppp/profile/add', addParams);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
