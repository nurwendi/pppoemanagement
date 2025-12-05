import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';
import { getConfig } from '@/lib/config';

export async function GET() {
    try {
        const config = getConfig();
        const wanInterface = config.wanInterface;

        if (!wanInterface) {
            return NextResponse.json({ error: 'WAN Interface not configured' }, { status: 400 });
        }

        const client = await getMikrotikClient();

        // Get interface stats (cumulative bytes)
        const interfaces = await client.write('/interface/print', [`?name=${wanInterface}`]);

        if (!interfaces || interfaces.length === 0) {
            return NextResponse.json({ error: `Interface ${wanInterface} not found` }, { status: 404 });
        }

        const iface = interfaces[0];

        // For real-time rate, we need to use monitor-traffic
        // This returns tx-bits-per-second and rx-bits-per-second
        let rate = { txRate: 0, rxRate: 0 };

        try {
            // monitor-traffic with once=true gives a single snapshot
            const monitorResult = await client.write('/interface/monitor-traffic', [
                `=interface=${wanInterface}`,
                '=once='
            ]);

            if (monitorResult && monitorResult.length > 0) {
                const mon = monitorResult[0];
                rate.txRate = parseInt(mon['tx-bits-per-second'] || 0);
                rate.rxRate = parseInt(mon['rx-bits-per-second'] || 0);
            }
        } catch (monitorError) {
            console.error('Monitor traffic error:', monitorError);
            // Fall back to calculating rate from bytes if monitor fails
        }

        // From WAN interface perspective:
        // rx = data coming IN from internet = Download (from LAN user view)
        // tx = data going OUT to internet = Upload (from LAN user view)
        return NextResponse.json({
            interface: wanInterface,
            // Total bytes (cumulative) - swapped for user perspective
            downloadBytes: parseInt(iface['rx-byte'] || 0),  // rx on WAN = download
            uploadBytes: parseInt(iface['tx-byte'] || 0),    // tx on WAN = upload
            // Real-time rate in bits per second - swapped for user perspective
            downloadRate: rate.rxRate,  // rx on WAN = download
            uploadRate: rate.txRate,    // tx on WAN = upload
            // Interface status
            running: iface.running === 'true',
            disabled: iface.disabled === 'true',
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error fetching real-time traffic:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
