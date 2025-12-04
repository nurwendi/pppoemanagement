import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'app-settings.json');

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'logo' or 'favicon'

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = type === 'favicon' ? 'favicon.ico' : 'logo.png';
        const filePath = path.join(process.cwd(), 'public', filename);

        await writeFile(filePath, buffer);

        // If logo, update app-settings.json with the logo URL
        if (type === 'logo') {
            let settings = { appName: 'Mikrotik Manager', logoUrl: '' };

            // Read existing settings
            if (fs.existsSync(settingsPath)) {
                const data = fs.readFileSync(settingsPath, 'utf8');
                settings = JSON.parse(data);
            }

            // Update logoUrl with a cache-busting timestamp
            settings.logoUrl = `/${filename}?t=${Date.now()}`;

            // Save updated settings
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        }

        return NextResponse.json({ success: true, path: `/${filename}` });
    } catch (error) {
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
