import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function GET() {
    try {
        const client = await getMikrotikClient();

        // Fetch PPPoE active connections
        const activeConnections = await client.write('/ppp/active/print');

        // Fetch all PPPoE secrets (users)
        const allUsers = await client.write('/ppp/secret/print');

        // Fetch system resources
        const resources = await client.write('/system/resource/print');
        const resource = resources[0] || {};

        // Fetch CPU temperature (if available)
        let temperature = null;
        try {
            const health = await client.write('/system/health/print');
            // Check for various temperature sensor names
            const tempItem = health.find(h =>
                h.name === 'temperature' ||
                h.name === 'cpu-temperature' ||
                h.name === 'board-temperature'
            );

            if (tempItem) {
                temperature = parseInt(tempItem.value);
            }
        } catch (e) {
            // Temperature not available on all Mikrotik devices
        }

        // Fetch interface statistics
        const interfaces = await client.write('/interface/print', ['=stats']);
        const interfaceStats = interfaces
            .filter(iface => {
                // Exclude PPPoE client interfaces (pppoe-out)
                const name = iface.name || '';
                return !name.startsWith('pppoe-out') && !name.startsWith('<pppoe-');
            })
            .map(iface => ({
                name: iface.name,
                type: iface.type,
                running: iface.running === 'true',
                txRate: parseInt(iface['tx-bits-per-second'] || 0),
                rxRate: parseInt(iface['rx-bits-per-second'] || 0),
                txBytes: parseInt(iface['tx-byte'] || 0),
                rxBytes: parseInt(iface['rx-byte'] || 0)
            }));

        // Calculate stats
        const pppoeActive = activeConnections.length;
        const pppoeOffline = allUsers.length - pppoeActive;
        const cpuLoad = parseInt(resource['cpu-load'] || 0);
        const memoryUsed = parseInt(resource['free-memory'] || 0);
        const memoryTotal = parseInt(resource['total-memory'] || 0);

        return NextResponse.json({
            pppoeActive,
            pppoeOffline,
            cpuLoad,
            memoryUsed: memoryTotal - memoryUsed,
            memoryTotal,
            temperature,
            interfaces: interfaceStats // Show all interfaces
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({
            error: error.message,
            pppoeActive: 0,
            pppoeOffline: 0,
            cpuLoad: 0,
            memoryUsed: 0,
            memoryTotal: 0,
            temperature: null,
            interfaces: []
        }, { status: 500 });
    }
}
