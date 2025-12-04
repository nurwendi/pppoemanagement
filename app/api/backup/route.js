import { NextResponse } from 'next/server';
import { createBackup, listBackups } from '@/lib/backup';

export async function GET(request) {
    try {
        const backups = await listBackups();
        return NextResponse.json(backups);
    } catch (error) {
        console.error('Failed to list backups:', error);
        return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const result = await createBackup();
        return NextResponse.json({
            success: true,
            backup: result
        });
    } catch (error) {
        console.error('Failed to create backup:', error);
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }
}
