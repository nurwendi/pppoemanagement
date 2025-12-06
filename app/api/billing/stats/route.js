import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const paymentsFile = path.join(process.cwd(), 'billing-payments.json');

async function getPayments() {
    try {
        const data = await fs.readFile(paymentsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function GET() {
    const payments = await getPayments();

    const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    // Use Asia/Jakarta timezone for date calculations
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const today = jakartaNow.toISOString().split('T')[0];
    const currentMonth = jakartaNow.toISOString().slice(0, 7); // YYYY-MM

    const todaysRevenue = payments
        .filter(p => {
            if (p.status !== 'completed') return false;
            const paymentDate = new Date(p.date);
            const jakartaPaymentDate = new Date(paymentDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const paymentDay = jakartaPaymentDate.toISOString().split('T')[0];
            return paymentDay === today;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const thisMonthRevenue = payments
        .filter(p => {
            if (p.status !== 'completed') return false;
            const paymentDate = new Date(p.date);
            const jakartaPaymentDate = new Date(paymentDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const paymentMonth = jakartaPaymentDate.toISOString().slice(0, 7);
            return paymentMonth === currentMonth;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingCount = payments.filter(p => p.status === 'pending').length;

    const totalUnpaid = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
        totalRevenue,
        thisMonthRevenue,
        todaysRevenue,
        pendingCount,
        totalUnpaid,
        totalTransactions: payments.length
    });
}
