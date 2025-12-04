import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import CompanyLogo from '@/components/CompanyLogo';

// Helper to read JSON files
async function readJsonFile(filename) {
    try {
        const filePath = path.join(process.cwd(), filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return filename === 'payments.json' ? [] : {};
    }
}

export default async function InvoicePage({ params }) {
    const { id } = await params;
    const payments = await readJsonFile('payments.json');
    const payment = payments.find(p => p.id === id);

    if (!payment) {
        notFound();
    }

    const customers = await readJsonFile('customer-data.json');
    const settings = await readJsonFile('billing-settings.json');
    const customer = customers[payment.username] || {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden print:shadow-none print:max-w-none">
                {/* Print Button */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-end print:hidden">
                    <PrintButton />
                </div>

                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">TAGIHAN</h1>
                            <p className="text-gray-500">#{payment.id}</p>
                        </div>
                        <div className="text-right">
                            {settings.logoUrl && (
                                <div className="flex justify-end mb-3">
                                    <CompanyLogo src={settings.logoUrl} alt="Company Logo" />
                                </div>
                            )}
                            <h2 className="font-bold text-xl text-gray-800">{settings.companyName || 'Mikrotik Manager'}</h2>
                            <p className="text-sm text-gray-500 whitespace-pre-line">{settings.companyAddress}</p>
                            {settings.companyContact && <p className="text-sm text-gray-500">{settings.companyContact}</p>}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Tagihan Kepada:</p>
                            <p className="text-lg font-bold text-gray-900">
                                {customer.name || payment.username}
                            </p>
                            {customer.address && (
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{customer.address}</p>
                            )}
                            {customer.phone && (
                                <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>
                            )}
                            {customer.customerNumber && (
                                <p className="text-xs text-gray-400 mt-2">No. Pelanggan: {customer.customerNumber}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-500 mb-1">Tanggal:</p>
                            <p className="text-gray-900">{formatDate(payment.date)}</p>
                            <p className="text-sm font-medium text-gray-500 mt-2 mb-1">Status:</p>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'completed'
                                ? 'bg-green-100 text-green-800 print:bg-transparent print:text-black print:border print:border-black'
                                : 'bg-red-100 text-red-800 print:bg-transparent print:text-black print:border print:border-black'
                                }`}>
                                {payment.status === 'completed' ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 print:bg-transparent print:border print:border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Deskripsi</span>
                            <span className="text-gray-600 font-medium">Jumlah</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-t border-gray-200">
                            <span className="text-gray-900 font-medium">Pembayaran Layanan Internet</span>
                            <span className="text-gray-900 font-bold">{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Total</span>
                            <span className="text-lg font-bold text-blue-600 print:text-black">{formatCurrency(payment.amount)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    {settings.invoiceFooter && (
                        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-100">
                            <p>{settings.invoiceFooter}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
