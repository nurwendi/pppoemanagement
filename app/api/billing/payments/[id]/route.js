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

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, amount, notes } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        let payments = await getPayments();
        // Convert both to string for comparison
        const paymentIndex = payments.findIndex(p => String(p.id) === String(id));

        if (paymentIndex === -1) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        const currentPayment = payments[paymentIndex];

        payments[paymentIndex] = {
            ...currentPayment,
            status: status,
            date: status === 'completed' ? new Date().toISOString() : currentPayment.date, // Update date if completed
            amount: amount || currentPayment.amount,
            notes: notes !== undefined ? notes : currentPayment.notes
        };

        // If postponed, create invoice for next month
        if (status === 'postponed') {
            let currentMonth = currentPayment.month;
            let currentYear = currentPayment.year;

            // Handle edge case if month/year missing (parse from date or default)
            if (currentMonth === undefined || currentYear === undefined) {
                const d = new Date(currentPayment.date);
                currentMonth = d.getMonth();
                currentYear = d.getFullYear();
            } else {
                currentMonth = parseInt(currentMonth);
                currentYear = parseInt(currentYear);
            }

            let nextMonth = currentMonth + 1;
            let nextYear = currentYear;

            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear++;
            }

            // Check if next month invoice already exists
            const exists = payments.some(p =>
                p.username === currentPayment.username &&
                parseInt(p.month) === nextMonth &&
                parseInt(p.year) === nextYear
            );

            if (!exists) {
                // Generate Invoice Number
                const yy = String(nextYear).slice(-2);
                const mm = String(nextMonth + 1).padStart(2, '0');

                // Extract customer number from current invoice or default
                let custNum = '0000';
                if (currentPayment.invoiceNumber) {
                    const parts = currentPayment.invoiceNumber.split('/');
                    if (parts.length >= 4) custNum = parts[3];
                }

                const seq = String(payments.length + 2).padStart(4, '0'); // Estimate sequence
                const newInvoiceNumber = `INV/${yy}/${mm}/${custNum}/${seq}`;

                const nextInvoice = {
                    id: Date.now().toString() + '_next', // Ensure unique ID
                    date: new Date().toISOString(),
                    status: 'pending', // Pending status
                    invoiceNumber: newInvoiceNumber,
                    username: currentPayment.username,
                    amount: currentPayment.amount,
                    month: nextMonth,
                    year: nextYear,
                    notes: `Tagihan bulan ${nextMonth + 1}/${nextYear} (Auto-generated from postponement)`
                };

                payments.push(nextInvoice);
            }
        }

        await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2));

        return NextResponse.json({ success: true, payment: payments[paymentIndex] });
    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }
}
