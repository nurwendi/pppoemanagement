import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/security';

export async function getUserFromRequest(request) {
    try {
        // 1. Check for Authorization header (Bearer token)
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            return await verifyToken(token);
        }

        // 2. Check for auth_token cookie (Web fallback)
        const cookieToken = request.cookies.get('auth_token');
        if (cookieToken) {
            return await verifyToken(cookieToken.value);
        }

        return null;
    } catch (error) {
        console.error('Error parsing auth token:', error);
        return null;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
