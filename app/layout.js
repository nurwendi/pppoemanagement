import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

import { getConfig } from '@/lib/config';

export async function generateMetadata() {
    const config = getConfig();
    return {
        title: config.title || 'Mikrotik PPPoE Manager',
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
