import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';
import { promises as fs } from 'fs';
import path from 'path';

const paymentsFile = path.join(process.cwd(), 'billing-payments.json');

async function getPayments() {
    try {
        const data = await fs.readFile(paymentsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function getUsersWithUnpaidInvoices() {
    const payments = await getPayments();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get all payments for current month
    const currentMonthPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear &&
            p.status !== 'completed';
    });

    // Get unique usernames with unpaid invoices
    const unpaidUsers = [...new Set(currentMonthPayments.map(p => p.username))];
    return unpaidUsers;
}

async function getAutoDropSettings() {
    try {
        const settingsFile = path.join(process.cwd(), 'billing-settings.json');
        const data = await fs.readFile(settingsFile, 'utf8');
        const settings = JSON.parse(data);
        return settings.autoDropDate || 10; // Default to 10th if not set
    } catch (error) {
        return 10; // Default to 10th if settings file doesn't exist
    }
}

export async function POST(request) {
    try {
        const { action } = await request.json();

        if (action !== 'check-and-drop') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Get users with unpaid invoices
        const unpaidUsers = await getUsersWithUnpaidInvoices();

        if (unpaidUsers.length === 0) {
            return NextResponse.json({
                message: 'No users with unpaid invoices',
                droppedUsers: []
            });
        }

        // Connect to Mikrotik and change profile to DROP
        const client = await getMikrotikClient();
        const droppedUsers = [];

        for (const username of unpaidUsers) {
            try {
                // Find the user
                const users = await client.write('/ppp/secret/print', [
                    `?name=${username}`
                ]);

                if (users && users.length > 0) {
                    const user = users[0];

                    // Update profile to DROP
                    await client.write('/ppp/secret/set', [
                        `=.id=${user['.id']}`,
                        '=profile=DROP'
                    ]);

                    droppedUsers.push(username);

                    // Disconnect active connection if any
                    const activeConnections = await client.write('/ppp/active/print', [
                        `?name=${username}`
                    ]);

                    if (activeConnections && activeConnections.length > 0) {
                        await client.write('/ppp/active/remove', [
                            `=.id=${activeConnections[0]['.id']}`
                        ]);
                    }
                }
            } catch (error) {
                console.error(`Failed to drop user ${username}:`, error);
            }
        }

        return NextResponse.json({
            message: `Successfully dropped ${droppedUsers.length} users`,
            droppedUsers,
            totalUnpaid: unpaidUsers.length
        });

    } catch (error) {
        console.error('Auto-drop error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
