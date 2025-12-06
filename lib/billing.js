
import { getMikrotikClient } from '@/lib/mikrotik';
import { promises as fs } from 'fs';
import path from 'path';

const paymentsFile = path.join(process.cwd(), 'billing-payments.json');
const customerDataPath = path.join(process.cwd(), 'customer-data.json');

async function getPayments() {
    try {
        const data = await fs.readFile(paymentsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function savePayments(payments) {
    await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2));
}

async function getCustomerData() {
    try {
        const data = await fs.readFile(customerDataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

/**
 * Generate invoices for a specific month and year
 * @param {number} month 0-11
 * @param {number} year YYYY
 * @returns {Promise<{generated: number, skipped: number, newPayments: Array, errors: Array}>}
 */
export async function generateInvoices(month, year) {
    // Use provided month/year or default to current
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    try {
        const client = await getMikrotikClient();
        const users = await client.write('/ppp/secret/print');
        const profiles = await client.write('/ppp/profile/print');

        const payments = await getPayments();
        const customers = await getCustomerData();

        let generatedCount = 0;
        let skippedCount = 0;
        const newPayments = [];

        // Calculate sequence start
        let sequenceCounter = payments.length + 1;

        for (const user of users) {
            // Check if invoice already exists
            const existingInvoice = payments.find(p => {
                const pDate = new Date(p.date);
                return p.username === user.name &&
                    pDate.getMonth() === targetMonth &&
                    pDate.getFullYear() === targetYear;
            });

            if (existingInvoice) {
                skippedCount++;
                continue;
            }

            // Find user's profile
            const userProfile = profiles.find(p => p.name === user.profile);

            // Parse price
            let amount = 0;
            if (userProfile?.comment && userProfile.comment.includes('price:')) {
                const match = userProfile.comment.match(/price:(\d+)/);
                if (match) {
                    amount = parseInt(match[1]);
                }
            }

            if (amount > 0) {
                const invoiceDate = new Date(Date.UTC(targetYear, targetMonth, 1));

                // Calculate arrears
                const pastInvoices = payments.filter(p =>
                    p.username === user.name &&
                    (p.status === 'pending' || p.status === 'postponed') &&
                    new Date(p.date) < invoiceDate
                );

                let arrearsAmount = 0;
                if (pastInvoices.length > 0) {
                    arrearsAmount = pastInvoices.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                    // Mark past invoices as merged
                    pastInvoices.forEach(p => {
                        const idx = payments.findIndex(pay => pay.id === p.id);
                        if (idx !== -1) {
                            payments[idx].status = 'merged';
                            payments[idx].notes = (payments[idx].notes || '') + ` (Merged)`;
                        }
                    });
                }

                // Format Invoice Number
                const yy = String(targetYear).slice(-2);
                const mm = String(targetMonth + 1).padStart(2, '0');
                const custNumber = customers[user.name]?.customerNumber || '0000';
                const seq = String(sequenceCounter).padStart(4, '0');

                const invoiceNumber = `INV/${yy}/${mm}/${custNumber}/${seq}`;
                sequenceCounter++;

                const monthName = invoiceDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                let notes = `Invoice for ${monthName}`;
                if (arrearsAmount > 0) {
                    notes += ` (Termasuk tunggakan: ${arrearsAmount})`;
                }

                const newPayment = {
                    id: String(Date.now() + Math.random()).replace('.', ''), // Safe String ID
                    invoiceNumber: invoiceNumber,
                    username: user.name,
                    amount: amount + arrearsAmount,
                    method: 'pending',
                    status: 'pending',
                    date: invoiceDate.toISOString(),
                    notes: notes
                };

                payments.push(newPayment);
                newPayments.push(newPayment);
                generatedCount++;
            }
        }

        await savePayments(payments);

        return {
            generated: generatedCount,
            skipped: skippedCount,
            newPayments: newPayments,
            month: targetMonth,
            year: targetYear
        };

    } catch (error) {
        console.error('Invoice generation error:', error);
        throw error;
    }
}
