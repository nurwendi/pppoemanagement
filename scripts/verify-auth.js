// Standalone verification script


// Mock bcrypt for testing environment if needed, or ensure it works
// Since we are running this with node, we need to make sure imports work.
// However, our lib/auth.js uses ES modules (import/export).
// We might need to use a temporary test file that uses require if we run with node directly,
// or use a runner that supports ESM.
// Given the environment, let's try to create a test that imports the module if package.json has "type": "module"
// Checking package.json... it doesn't have "type": "module".
// So our lib/auth.js using 'import' might fail if run directly with 'node'.
// But wait, Next.js handles this.
// To test this in this environment without spinning up the full Next.js app,
// I will create a standalone test script that mimics the logic using CommonJS for simplicity in verification,
// OR I can try to run it with `node -r esm` if available, but that's risky.

// BETTER APPROACH:
// I will create a temporary test file that duplicates the logic of lib/auth.js but using CommonJS
// just to verify the logic itself (hashing, file operations).
// AND I will try to hit the APIs if the server was running, but I can't rely on that.
// So unit testing the logic is the best I can do here.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(process.cwd(), 'data', 'users-test.json');

async function testAuthFlow() {
    console.log('Starting Auth Flow Verification...');

    // 1. Setup
    if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);

    // Mocking the file path in our "library" for this test
    const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    const getUsers = () => {
        if (!fs.existsSync(USERS_FILE)) return [];
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    };

    // 2. Create Admin
    console.log('Test: Create Admin User');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const adminUser = {
        id: '1',
        username: 'admin',
        passwordHash: hash,
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    saveUsers([adminUser]);

    const users = getUsers();
    if (users.length !== 1 || users[0].username !== 'admin') throw new Error('Failed to create admin');
    console.log('✅ Admin created');

    // 3. Verify Password
    console.log('Test: Verify Password');
    const storedUser = users.find(u => u.username === 'admin');
    const isValid = await bcrypt.compare('admin123', storedUser.passwordHash);
    if (!isValid) throw new Error('Password verification failed');
    console.log('✅ Password verified');

    // 4. Create Secondary User
    console.log('Test: Create Secondary User');
    const userHash = await bcrypt.hash('user123', 10);
    const newUser = {
        id: '2',
        username: 'testuser',
        passwordHash: userHash,
        role: 'viewer',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);

    if (getUsers().length !== 2) throw new Error('Failed to add second user');
    console.log('✅ Secondary user created');

    // 5. Cleanup
    if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
    console.log('✅ Cleanup done');

    console.log('🎉 All tests passed!');
}

testAuthFlow().catch(console.error);
