
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const settingsFile = path.join(process.cwd(), 'billing-settings.json');

async function getSettings() {
    try {
        const data = await fs.readFile(settingsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Default settings
        return {
            companyName: 'Mikrotik Manager',
            companyAddress: 'Jalan Raya Internet No. 1',
            companyContact: '081234567890',
            invoiceFooter: 'Terima kasih atas kepercayaan Anda.',
            logoUrl: '',
            autoDropDate: 10 // Day of month to auto-drop unpaid users
        };
    }
}

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function POST(request) {
    try {
        const newSettings = await request.json();
        await fs.writeFile(settingsFile, JSON.stringify(newSettings, null, 2));
        return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
