'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CommissionsPage() {
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, usersRes] = await Promise.all([
                fetch('/api/billing/payments'),
                fetch('/api/admin/users')
            ]);

            if (paymentsRes.ok) setPayments(await paymentsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableMonths = () => {
        const months = new Set();
        payments.forEach(p => {
            const date = new Date(p.date);
            months.add(`${date.getFullYear()}-${date.getMonth()}`);
        });
        // Ensure current month is always available
        const current = new Date();
        months.add(`${current.getFullYear()}-${current.getMonth()}`);

        return Array.from(months).sort().reverse().map(m => {
            const [year, month] = m.split('-');
            return { year: parseInt(year), month: parseInt(month) };
        });
    };

    const calculateCommissions = () => {
        const report = {};

        // Filter payments by month/year and status
        const filteredPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate.getMonth() === selectedMonth &&
                pDate.getFullYear() === selectedYear &&
                p.status === 'completed';
        });

        filteredPayments.forEach(payment => {
            if (payment.commissions && Array.isArray(payment.commissions)) {
                payment.commissions.forEach(comm => {
                    if (!report[comm.userId]) {
                        report[comm.userId] = {
                            userId: comm.userId,
                            username: comm.username,
                            role: comm.role,
                            totalSales: 0,
                            totalCommission: 0,
                            transactionCount: 0
                        };
                    }
                    report[comm.userId].totalSales += parseFloat(payment.amount);
                    report[comm.userId].totalCommission += parseFloat(comm.amount);
                    report[comm.userId].transactionCount += 1;
                });
            }
        });

        return Object.values(report);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const commissionData = calculateCommissions();
    const totalCommissionPayout = commissionData.reduce((sum, item) => sum + item.totalCommission, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/billing" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Commission Reports</h1>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-500" />
                    <select
                        value={`${selectedYear}-${selectedMonth}`}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split('-');
                            setSelectedYear(parseInt(year));
                            setSelectedMonth(parseInt(month));
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {getAvailableMonths().map(({ year, month }) => (
                            <option key={`${year}-${month}`} value={`${year}-${month}`}>
                                {new Date(year, month, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total Payout</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCommissionPayout)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent / Technician</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : commissionData.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No commissions found for this period</td></tr>
                        ) : (
                            commissionData.map((item) => (
                                <tr key={item.userId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 p-2 rounded-full">
                                                <Users size={20} className="text-gray-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{item.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.role === 'agent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {item.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.transactionCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(item.totalSales)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                        {formatCurrency(item.totalCommission)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
