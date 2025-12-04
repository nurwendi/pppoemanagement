import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const preferencesFile = path.join(process.cwd(), 'user-preferences.json');

async function getPreferences() {
    try {
        const data = await fs.readFile(preferencesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return defaults if file doesn't exist or error
        return {
            display: {
                theme: 'system',
            },
            dashboard: {
                refreshInterval: 5000
            }
        };
    }
}

async function savePreferences(preferences) {
    await fs.writeFile(preferencesFile, JSON.stringify(preferences, null, 2));
}

export async function GET() {
    const preferences = await getPreferences();
    return NextResponse.json(preferences);
}

export async function POST(request) {
    try {
        const newPreferences = await request.json();
        const currentPreferences = await getPreferences();

        // Deep merge or overwrite sections
        const updatedPreferences = {
            ...currentPreferences,
            ...newPreferences,
            display: { ...currentPreferences.display, ...newPreferences.display },
            dashboard: { ...currentPreferences.dashboard, ...newPreferences.dashboard },
            tables: { ...currentPreferences.tables, ...newPreferences.tables }
        };

        await savePreferences(updatedPreferences);
        return NextResponse.json({ message: 'Preferences saved successfully', preferences: updatedPreferences });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }
}
