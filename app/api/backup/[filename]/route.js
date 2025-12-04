import { NextResponse } from 'next/server';
import { restoreBackup, deleteBackup, getBackupPath } from '@/lib/backup';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

export async function GET(request, { params }) {
    try {
        const { filename } = await params;
        const backupPath = getBackupPath(filename);

        // Check if file exists
        await stat(backupPath);

        // Stream the file
        const fileStream = createReadStream(backupPath);

        return new NextResponse(fileStream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('Failed to download backup:', error);
        return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { filename } = await params;
        await restoreBackup(filename);

        return NextResponse.json({
            success: true,
            message: 'Backup restored successfully'
        });
    } catch (error) {
        console.error('Failed to restore backup:', error);
        return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { filename } = await params;
        await deleteBackup(filename);

        return NextResponse.json({
            success: true,
            message: 'Backup deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete backup:', error);
        return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
    }
}
