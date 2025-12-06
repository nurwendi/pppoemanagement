import { NextResponse } from 'next/server';
import { generateInvoices } from '@/lib/billing';

export async function POST(request) {
    try {
        const body = await request.json();
        const { month, year } = body;

        const result = await generateInvoices(month, year);
        const monthName = new Date(result.year, result.month, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

        return NextResponse.json({
            message: `Generated ${result.generated} invoices for ${monthName}. Skipped ${result.skipped} existing invoices.`,
            ...result
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
