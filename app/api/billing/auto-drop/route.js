import { NextResponse } from 'next/server';
import { checkAndDropUsers } from '@/lib/auto-drop';

export async function POST(request) {
    try {
        const { action } = await request.json();

        if (action !== 'check-and-drop') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const result = await checkAndDropUsers();

        return NextResponse.json(result);

    } catch (error) {
        console.error('Auto-drop error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
