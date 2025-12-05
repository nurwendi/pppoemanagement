import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'cpu-history.json');
const MAX_HISTORY_DAYS = 3; // Keep 3 days of data
const SAMPLE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCpuHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading CPU history:', error);
    }
    return [];
}

function saveCpuHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving CPU history:', error);
    }
}

export async function GET() {
    try {
        const client = await getMikrotikClient();

        // Fetch system resources
        const resources = await client.write('/system/resource/print');
        const resource = resources[0] || {};

        const cpuLoad = parseInt(resource['cpu-load'] || 0);

        // Add to history (every 5 minutes)
        const history = getCpuHistory();

        // Check if we should add a new data point (5 minutes since last one)
        const lastEntry = history[history.length - 1];
        const shouldAddNew = !lastEntry || (Date.now() - lastEntry.timestamp) >= SAMPLE_INTERVAL;

        if (shouldAddNew) {
            history.push({
                timestamp: Date.now(),
                cpuLoad
            });

            // Prune old data (keep only last 3 days)
            const cutoff = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
            const trimmedHistory = history.filter(entry => entry.timestamp > cutoff);
            saveCpuHistory(trimmedHistory);
        }

        // Return current history
        const currentHistory = getCpuHistory();

        return NextResponse.json({
            current: cpuLoad,
            history: currentHistory.map(h => ({
                time: new Date(h.timestamp).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                cpuLoad: h.cpuLoad,
                timestamp: h.timestamp,
                date: new Date(h.timestamp).toLocaleString()
            }))
        });

    } catch (error) {
        console.error('CPU API error:', error);
        return NextResponse.json({
            error: error.message,
            current: 0,
            history: []
        }, { status: 500 });
    }
}
