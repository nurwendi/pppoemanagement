// Built-in fetch is used in Node.js v18+

const BASE_URL = 'http://localhost:3000';

async function verifyDeveloperPage() {
    console.log('--- Verifying Developer API Page ---');

    // 1. Login to get cookie
    console.log('\n1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    const loginData = await loginRes.json();
    const cookie = loginRes.headers.get('set-cookie');

    if (!loginData.success) {
        console.error('Login failed');
        return;
    }
    console.log('Login successful.');

    // 2. Check /api/auth/me with cookie to see if token is returned
    console.log('\n2. Checking /api/auth/me with cookie...');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Cookie': cookie }
    });
    const meData = await meRes.json();

    if (meData.token) {
        console.log('SUCCESS: Token returned in /api/auth/me');
        console.log('Token:', meData.token);
    } else {
        console.error('FAILURE: Token NOT returned in /api/auth/me');
    }

    console.log('\n--- Verification Complete ---');
}

verifyDeveloperPage();
