'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Settings, Server, Activity, LogOut, Menu, X, ChevronDown, ChevronRight, Network, CreditCard, WifiOff, Database, Code } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPppoeExpanded, setIsPppoeExpanded] = useState(true);

    const [userRole, setUserRole] = useState(null);
    const [appSettings, setAppSettings] = useState({ appName: 'Mikrotik Manager', logoUrl: '' });

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch user');
            })
            .then(data => setUserRole(data.user.role))
            .catch(() => setUserRole(null));

        // Fetch app settings
        fetch('/api/app-settings')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch app settings');
            })
            .then(data => setAppSettings(data))
            .catch(() => setAppSettings({ appName: 'Mikrotik Manager', logoUrl: '' }));
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const togglePppoe = () => {
        setIsPppoeExpanded(!isPppoeExpanded);
    };



    // Define top nav items
    const topNavItems = [
        { href: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'partner', 'viewer'] },
        { href: '/billing', icon: CreditCard, label: 'Billing & Payments', roles: ['admin', 'partner'] },
    ].filter(item => !item.roles || (userRole && item.roles.includes(userRole)));

    // Define bottom nav items
    const bottomNavItems = [
        { href: '/system-users', icon: Users, label: 'System Users', roles: ['admin'] },
        { href: '/settings', icon: Server, label: 'Connection', roles: ['admin'] },
        { href: '/backup', icon: Database, label: 'Backup & Restore', roles: ['admin'] },
    ].filter(item => !item.roles || (userRole && item.roles.includes(userRole)));

    const pppoeItems = [
        { href: '/users', icon: Users, label: 'Users' },
        { href: '/active', icon: Activity, label: 'Active Connections' },
        { href: '/offline', icon: WifiOff, label: 'Offline Users' },
        { href: '/profiles', icon: Settings, label: 'Profiles', roles: ['admin'] },
    ].filter(item => !item.roles || (userRole && item.roles.includes(userRole)));



    return (
        <>
            {/* Hamburger Menu Button - Mobile Only */}
            {/* Hamburger Menu Button - Mobile Only */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 z-40 transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                glass-mode:bg-white/80 glass-mode:dark:bg-gray-900/80 glass-mode:backdrop-blur-md glass-mode:border-r glass-mode:border-gray-200/50 glass-mode:dark:border-white/10
            `}>
                <div className="flex flex-col min-h-full">
                    {/* Mobile Close Button */}
                    <div className="lg:hidden flex justify-end mb-2">
                        <button onClick={closeSidebar} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    {/* Logo Section */}
                    <div className="mb-8 mt-2">
                        {appSettings.logoUrl ? (
                            <img
                                src={appSettings.logoUrl}
                                alt="Logo"
                                className="h-12 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <h2 className={`text-2xl font-bold text-blue-600 dark:text-white ${appSettings.logoUrl ? 'hidden' : ''}`}>
                            {appSettings.appName}
                        </h2>
                    </div>

                    <nav className="flex-1">
                        {/* Top Nav Items (Dashboard, Billing) */}
                        {topNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${pathname === item.href
                                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* PPPoE Parent Section */}
                        <div className="mb-2">
                            <button
                                onClick={togglePppoe}
                                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Network size={20} />
                                    <span>PPPoE</span>
                                </div>
                                {isPppoeExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {/* PPPoE Children */}
                            {isPppoeExpanded && (
                                <div className="ml-8 mt-1">
                                    {pppoeItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeSidebar}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors ${pathname === item.href
                                                ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>



                        {/* Bottom Nav Items (System Users, Connection, Backup) */}
                        {bottomNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${pathname === item.href
                                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {userRole === 'admin' && (
                        <Link
                            href="/app-settings"
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${pathname === '/app-settings'
                                ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white'
                                }`}
                        >
                            <Settings size={20} />
                            <span>App Settings</span>
                        </Link>
                    )}

                    <button
                        onClick={() => {
                            handleLogout();
                            closeSidebar();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-white transition-colors mt-auto"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
