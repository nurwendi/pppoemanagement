'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, UserCheck, UserX, Calendar } from 'lucide-react';

export default function PartnerBillingPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/billing/stats/agent?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (loading && !stats) {
        return <div className="p-8 text-center text-gray-500">Loading stats...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Partner Dashboard</h1>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <Calendar className="text-gray-500" size={20} />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent outline-none text-gray-700 font-medium"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-transparent outline-none text-gray-700 font-medium ml-2"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Generated (Revenue) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Total Generated</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
                        <p className="text-sm text-gray-500 mt-1">Total pendapatan dari pelanggan Anda</p>
                    </div>

                    {/* Partner Commission */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Komisi Partner</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.commission)}</h3>
                        <p className="text-sm text-gray-500 mt-1">Penghasilan bersih Anda (Agen + Teknisi)</p>
                    </div>

                    {/* Paid Customers */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <UserCheck size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Sudah Bayar</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.paidCount}</h3>
                        <p className="text-sm text-gray-500 mt-1">Pelanggan lunas bulan ini</p>
                    </div>

                    {/* Unpaid Customers */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <UserX size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Belum Bayar</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.unpaidCount}</h3>
                        <p className="text-sm text-gray-500 mt-1">Pelanggan belum bayar</p>
                    </div>
                </div>
            )}
        </div>
    );
}
