'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, ArrowUpDown } from 'lucide-react';

export default function OfflineUsersPage() {
    const [users, setUsers] = useState([]);
    const [activeConnections, setActiveConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const sortData = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedOfflineUsers = () => {
        const offlineUsers = users.filter(user => !activeConnections.some(conn => conn.name === user.name));

        if (!sortConfig.key) return offlineUsers;

        return [...offlineUsers].sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, activeRes] = await Promise.all([
                fetch('/api/pppoe/users'),
                fetch('/api/pppoe/active')
            ]);

            const usersData = await usersRes.json();
            const activeData = await activeRes.json();

            if (Array.isArray(usersData)) setUsers(usersData);
            if (Array.isArray(activeData)) setActiveConnections(activeData);

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const offlineUsers = getSortedOfflineUsers();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <WifiOff size={32} className="text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Offline Users</h1>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 glass-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Offline</p>
                            <p className="text-2xl font-bold text-gray-800">{offlineUsers.length}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <WifiOff size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden glass-card">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => sortData('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Name <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => sortData('profile')}
                            >
                                <div className="flex items-center gap-1">
                                    Profile <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => sortData('service')}
                            >
                                <div className="flex items-center gap-1">
                                    Service <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Known IP</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => sortData('last-logged-out')}
                            >
                                <div className="flex items-center gap-1">
                                    Last Logout <ArrowUpDown size={14} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : offlineUsers.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No offline users found</td></tr>
                        ) : (
                            offlineUsers.map((user) => (
                                <tr key={user['.id']} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">******</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.profile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.service}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-sm">
                                        {user['remote-address'] || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                                        {user['last-logged-out'] || '-'}
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
