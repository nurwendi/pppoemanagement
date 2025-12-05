import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'temperature-history.json');
const MAX_HISTORY_DAYS = 3; // Keep 3 days of data

function getTemperatureHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading temperature history:', error);
    }
    return [];
}

function saveTemperatureHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving temperature history:', error);
    }
}

export async function GET() {
    try {
        const client = await getMikrotikClient();

        // Fetch temperature
        let temperature = null;
        let sensorName = null;

        try {
            const health = await client.write('/system/health/print');

            // Check for various temperature sensor names
            const tempItem = health.find(h =>
                h.name === 'temperature' ||
                h.name === 'cpu-temperature' ||
                h.name === 'board-temperature' ||
                h.name === 'board-temperature1'
            );

            if (tempItem) {
                temperature = parseInt(tempItem.value);
                sensorName = tempItem.name;
            }
        } catch (e) {
            // Temperature not available on all Mikrotik devices
        }

        // If temperature is available, add to history (every 5 minutes)
        if (temperature !== null) {
            let history = getTemperatureHistory();
            const SAMPLE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

            // Check if we should add a new data point (5 minutes since last one)
            const lastEntry = history[history.length - 1];
            const shouldAddNew = !lastEntry || (Date.now() - lastEntry.timestamp) >= SAMPLE_INTERVAL;

            if (shouldAddNew) {
                history.push({
                    timestamp: Date.now(),
                    temperature,
                    sensorName
                });

                // Prune old data (keep only last 3 days)
                const cutoff = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
                history = history.filter(entry => entry.timestamp > cutoff);
                saveTemperatureHistory(history);
            }

            return NextResponse.json({
                current: temperature,
                sensorName,
                history: history.map(h => ({
                    time: new Date(h.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    temperature: h.temperature,
                    timestamp: h.timestamp,
                    date: new Date(h.timestamp).toLocaleString()
                }))
            });
        }

        return NextResponse.json({
            current: null,
            sensorName: null,
            history: [],
            message: 'Temperature sensor not available on this device'
        });

    } catch (error) {
        console.error('Temperature API error:', error);
        return NextResponse.json({
            error: error.message,
            current: null,
            history: []
        }, { status: 500 });
    }
}
