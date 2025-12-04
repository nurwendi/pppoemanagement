import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'app-settings.json');

export async function GET() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return NextResponse.json(JSON.parse(data));
        }
        return NextResponse.json({ appName: 'Mikrotik Manager', logoUrl: '' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { appName, logoUrl } = body;

        const settings = {
            appName: appName || 'Mikrotik Manager',
            logoUrl: logoUrl || ''
        };

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
