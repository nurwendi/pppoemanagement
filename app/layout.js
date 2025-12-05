import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

import fs from 'fs';
import path from 'path';

export async function generateMetadata() {
    try {
        const settingsPath = path.join(process.cwd(), 'app-settings.json');
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(data);
            return {
                title: settings.appName || 'Mikrotik PPPoE Manager',
                description: 'Manage PPPoE users and profiles',
            };
        }
    } catch (error) {
        console.error('Error reading app settings:', error);
    }
    return {
        title: 'Mikrotik PPPoE Manager',
        description: 'Manage PPPoE users and profiles',
    };
}

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
