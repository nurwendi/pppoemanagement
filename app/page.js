'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff, Cpu, HardDrive, Thermometer, Activity, ArrowUp, ArrowDown, RefreshCw, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {

    const [stats, setStats] = useState({
        pppoeActive: 0,
        pppoeOffline: 0,
        cpuLoad: 0,
        memoryUsed: 0,
        memoryTotal: 0,
        temperature: 0,
        interfaces: [],
        billing: {
            totalRevenue: 0,
            thisMonthRevenue: 0,
            todaysRevenue: 0,
            totalUnpaid: 0,
            pendingCount: 0
        },
        agentStats: null // New field for agent stats
    });
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [refreshInterval, setRefreshInterval] = useState(5000);

    useEffect(() => {
        // Fetch user role
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUserRole(data.user.role))
            .catch(err => console.error('Failed to fetch user role', err));

        // Fetch preferences to get refresh interval
        fetch('/api/app-settings/preferences')
            .then(res => res.json())
            .then(data => {
                if (data.dashboard?.refreshInterval) {
                    setRefreshInterval(data.dashboard.refreshInterval);
                }
            })
            .catch(err => console.error('Failed to fetch preferences', err));
    }, []);

    useEffect(() => {
        fetchStats();
        if (refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    const fetchStats = async () => {
        try {
            const [dashboardRes, billingRes, agentStatsRes] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/billing/stats'),
                fetch(`/api/billing/stats/agent?month=${new Date().getMonth()}&year=${new Date().getFullYear()}`)
            ]);

            const newStats = { ...stats };

            if (dashboardRes.ok) {
                const data = await dashboardRes.json();
                newStats.pppoeActive = data.pppoeActive;
                newStats.pppoeOffline = data.pppoeOffline;
                newStats.cpuLoad = data.cpuLoad;
                newStats.memoryUsed = data.memoryUsed;
                newStats.memoryTotal = data.memoryTotal;
                newStats.temperature = data.temperature;
                newStats.interfaces = data.interfaces;
            }

            if (billingRes.ok) {
                const data = await billingRes.json();
                newStats.billing = data;
            }

            if (agentStatsRes.ok) {
                const data = await agentStatsRes.json();
                if (data.role === 'partner') {
                    newStats.agentStats = data.stats;
                }
            }



            setStats(newStats);
            setLastUpdate(new Date());

        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', alert = false }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-lg shadow-md p-6 glass-card transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${alert ? 'border-2 border-red-500' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`text-${color}-600`} size={24} />
                </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 truncate" title={value}>{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        Last update: {lastUpdate.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            {userRole !== 'partner' && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="text-green-600" /> Financial Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={DollarSign}
                            title="Revenue This Month"
                            value={formatCurrency(stats.billing.thisMonthRevenue)}
                            subtitle={`Revenue for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                            color="green"
                        />
                        <StatCard
                            icon={Activity}
                            title="Today's Revenue"
                            value={formatCurrency(stats.billing.todaysRevenue)}
                            subtitle="Income received today"
                            color="blue"
                        />
                        <StatCard
                            icon={CreditCard}
                            title="Unpaid Invoices"
                            value={formatCurrency(stats.billing.totalUnpaid)}
                            subtitle={`${stats.billing.pendingCount} pending invoices`}
                            color="orange"
                        />
                    </div>
                </div>
            )}



            {/* PPPoE Stats */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="text-blue-600" /> PPPoE Users
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/active" className="block">
                        <StatCard
                            icon={Wifi}
                            title="PPPoE Active"
                            value={stats.pppoeActive}
                            subtitle="Users currently online"
                            color="green"
                        />
                    </Link>
                    <Link href="/offline" className="block">
                        <StatCard
                            icon={WifiOff}
                            title="PPPoE Offline"
                            value={stats.pppoeOffline}
                            subtitle="Users currently offline"
                            color="red"
                        />
                    </Link>
                </div>
            </div>

            {/* System Stats */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Cpu className="text-gray-600" /> System Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={Cpu}
                        title="CPU Usage"
                        value={`${stats.cpuLoad}%`}
                        subtitle="Current load"
                        color="blue"
                    />
                    <StatCard
                        icon={HardDrive}
                        title="Memory Usage"
                        value={`${Math.round((stats.memoryUsed / stats.memoryTotal) * 100)}%`}
                        subtitle={`${formatBytes(stats.memoryUsed)} / ${formatBytes(stats.memoryTotal)}`}
                        color="purple"
                    />
                    <StatCard
                        icon={Thermometer}
                        title="CPU Temperature"
                        value={stats.temperature ? `${stats.temperature}°C` : 'N/A'}
                        subtitle="System temperature"
                        color="orange"
                    />
                </div>
            </div>
        </div>
    );
}
