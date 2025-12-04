import { NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/auth';

export async function GET() {
    try {
        const users = await getUsers();
        // Remove password hash from response
        const safeUsers = users.map(({ passwordHash, ...user }) => user);
        return NextResponse.json(safeUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const newUser = await createUser(body);
        return NextResponse.json(newUser);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
