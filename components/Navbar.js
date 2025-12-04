'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Settings, Server, Activity, LogOut, Menu, X, ChevronDown, Network } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPppoeOpen, setIsPppoeOpen] = useState(false);
    const [appSettings, setAppSettings] = useState({ appName: 'Mikrotik Manager', logoUrl: '' });

    useEffect(() => {
        fetchAppSettings();
    }, []);

    const fetchAppSettings = async () => {
        try {
            const res = await fetch('/api/app-settings');
            if (res.ok) {
                const data = await res.json();
                setAppSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch app settings', error);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsPppoeOpen(false);
    };

    const navItems = [
        { href: '/', icon: Home, label: 'Dashboard' },
    ];

    const pppoeItems = [
        { href: '/users', icon: Users, label: 'Users' },
        { href: '/active', icon: Activity, label: 'Active Connections' },
        { href: '/profiles', icon: Settings, label: 'Profiles' },
    ];

    const settingsItems = [
        { href: '/app-settings', icon: Settings, label: 'App Settings' },
        { href: '/settings', icon: Server, label: 'Connection' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 shadow-sm glass-mode:bg-white/50 glass-mode:dark:bg-gray-900/50 glass-mode:border-white/20">
            <div className="max-w-full px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        {appSettings.logoUrl ? (
                            <img
                                src={appSettings.logoUrl}
                                alt="Logo"
                                className="h-10 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className={`w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl ${appSettings.logoUrl ? 'hidden' : ''}`}>
                            M
                        </div>
                        <span className="text-xl font-bold hidden sm:block">{appSettings.appName}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${pathname === item.href
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* PPPoE Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsPppoeOpen(!isPppoeOpen)}
                                onBlur={() => setTimeout(() => setIsPppoeOpen(false), 200)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${pppoeItems.some(item => pathname === item.href)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <Network size={18} />
                                <span>PPPoE</span>
                                <ChevronDown size={16} className={`transition-transform ${isPppoeOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isPppoeOpen && (
                                <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 min-w-[200px] border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                                    {pppoeItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsPppoeOpen(false)}
                                            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${pathname === item.href
                                                ? 'text-blue-600 dark:text-blue-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-300'
                                                }`}
                                        >
                                            <item.icon size={16} />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settings Items */}
                        {settingsItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${pathname === item.href
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${pathname === item.href
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* PPPoE Section */}
                        <div>
                            <button
                                onClick={() => setIsPppoeOpen(!isPppoeOpen)}
                                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Network size={18} />
                                    <span>PPPoE</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${isPppoeOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isPppoeOpen && (
                                <div className="ml-6 mt-1">
                                    {pppoeItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeMobileMenu}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                                                ? 'bg-gray-700 text-white'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                }`}
                                        >
                                            <item.icon size={16} />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settings Items */}
                        {settingsItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${pathname === item.href
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* Mobile Logout */}
                        <button
                            onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                            }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full mt-2"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
