'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const isInvoicePage = pathname.startsWith('/invoice');
    const isPublicPage = isLoginPage || isInvoicePage;

    return (
        <LanguageProvider>
            <div className="relative min-h-screen overflow-hidden">
                {/* Animated Background */}
                {/* Background */}
                <div className="fixed inset-0 -z-10 bg-white transition-colors duration-500" />

                {/* Glass Mode Background Overlay */}
                <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-500 glass-mode:opacity-100 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                {!isPublicPage && (
                    <>
                        <Sidebar />
                    </>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`min-h-screen ${!isPublicPage ? 'pt-8 px-8 pb-8 lg:pl-72' : ''}`}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </LanguageProvider>
    );
}
