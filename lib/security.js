import { NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-me';

async function getKey() {
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function signToken(payload) {
    try {
        const key = await getKey();
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(payload));
        const signature = await crypto.subtle.sign('HMAC', key, data);

        // Convert to base64
        const b64Data = Buffer.from(data).toString('base64');
        const b64Sig = Buffer.from(signature).toString('base64');

        return `${b64Data}.${b64Sig}`;
    } catch (error) {
        console.error('Error signing token:', error);
        return null;
    }
}

export async function verifyToken(token) {
    try {
        if (!token) return null;

        const [b64Data, b64Sig] = token.split('.');
        if (!b64Data || !b64Sig) return null;

        const key = await getKey();
        const data = Buffer.from(b64Data, 'base64');
        const signature = Buffer.from(b64Sig, 'base64');

        const isValid = await crypto.subtle.verify('HMAC', key, signature, data);

        if (isValid) {
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(data));
        }
        return null;
    } catch (error) {
        // console.error('Error verifying token:', error);
        return null;
    }
}
