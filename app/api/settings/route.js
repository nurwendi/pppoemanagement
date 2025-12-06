import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function GET() {
    const config = getConfig();

    // Mask passwords
    const safeConnections = config.connections.map(conn => ({
        ...conn,
        password: conn.password ? '******' : ''
    }));

    const emailConfig = config.email ? { ...config.email, password: config.email.password ? '******' : '' } : {};

    return NextResponse.json({
        connections: safeConnections,
        activeConnectionId: config.activeConnectionId,
        title: config.title || 'Mikrotik PPPoE Manager',
        wanInterface: config.wanInterface || '',
        email: emailConfig
    });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { connections, activeConnectionId, title, wanInterface, email } = body;

        if (!connections || !Array.isArray(connections)) {
            return NextResponse.json({ error: "Connections array is required" }, { status: 400 });
        }

        // Validate connections
        for (const conn of connections) {
            if (!conn.host || !conn.user || !conn.port) {
                return NextResponse.json({ error: "Host, User, and Port are required for all connections" }, { status: 400 });
            }
        }

        const oldConfig = getConfig();

        // Handle connection passwords (unchanged)
        const newConnections = connections.map(conn => {
            if (conn.password === '******') {
                const oldConn = oldConfig.connections?.find(c => c.id === conn.id);
                return { ...conn, password: oldConn?.password || '' };
            }
            return conn;
        });

        // Handle Email Password
        let newEmailConfig = email || {};
        if (newEmailConfig.password === '******') {
            newEmailConfig.password = oldConfig.email?.password || '';
        }

        const newConfig = {
            connections: newConnections,
            activeConnectionId,
            title,
            wanInterface,
            email: newEmailConfig
        };

        saveConfig(newConfig);

        // Test connection if active changed or updated
        try {
            // Force reconnection
            await getMikrotikClient();
            return NextResponse.json({ success: true, message: "Settings saved and connection verified" });
        } catch (connError) {
            const errorMessage = connError instanceof Error ? connError.message : String(connError);
            return NextResponse.json({ success: false, error: "Settings saved but connection failed: " + errorMessage }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
