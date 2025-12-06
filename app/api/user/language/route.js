import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUserFromRequest } from '@/lib/api-auth';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request) {
    try {
        const currentUser = await getUserFromRequest(request);

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { language } = await request.json();

        if (!language || !['id', 'en'].includes(language)) {
            return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        }

        // Read users file
        const data = await fs.readFile(USERS_FILE, 'utf8');
        const usersData = JSON.parse(data);
        const users = usersData.users || usersData;

        // Find and update user
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].language = language;

            // Save back to file
            const saveData = usersData.users ? { users } : users;
            await fs.writeFile(USERS_FILE, JSON.stringify(saveData, null, 2));

            return NextResponse.json({ success: true, language });
        }

        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating language:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
