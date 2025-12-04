import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'users.json');

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, newPassword } = body;

        if (!username || !newPassword) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        if (newPassword.length < 4) {
            return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
        }

        // Read existing users
        let users = {};
        if (fs.existsSync(usersPath)) {
            const data = fs.readFileSync(usersPath, 'utf8');
            users = JSON.parse(data);
        }

        // Update or create user
        users[username] = newPassword;

        // Save users
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
