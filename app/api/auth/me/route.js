import { NextResponse } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request) {
    const user = await getUserFromRequest(request);

    if (!user) {
        return unauthorizedResponse();
    }

    const token = Buffer.from(JSON.stringify({
        username: user.username,
        role: user.role,
        id: user.id
    })).toString('base64');

    return NextResponse.json({ user, token });
}
