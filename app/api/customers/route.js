import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/api-auth';

const CUSTOMER_DATA_PATH = path.join(process.cwd(), 'customer-data.json');

// Ensure file exists
function ensureCustomerDataFile() {
    if (!fs.existsSync(CUSTOMER_DATA_PATH)) {
        fs.writeFileSync(CUSTOMER_DATA_PATH, '{}', 'utf-8');
    }
}

// Read customer data
function readCustomerData() {
    ensureCustomerDataFile();
    const data = fs.readFileSync(CUSTOMER_DATA_PATH, 'utf-8');
    return JSON.parse(data);
}

// Write customer data
function writeCustomerData(data) {
    fs.writeFileSync(CUSTOMER_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request) {
    try {
        const customers = readCustomerData();

        // Filter based on role
        const user = getUserFromRequest(request);
        if (user) {
            try {
                if (user.role === 'agent') {
                    const filtered = {};
                    for (const [key, val] of Object.entries(customers)) {
                        if (val.agentId === user.id) filtered[key] = val;
                    }
                    return NextResponse.json(filtered);
                } else if (user.role === 'technician') {
                    const filtered = {};
                    for (const [key, val] of Object.entries(customers)) {
                        if (val.technicianId === user.id) filtered[key] = val;
                    }
                    return NextResponse.json(filtered);
                }
            } catch (e) {
                // Ignore token parse error
            }
        }

        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, name, address, phone, customerNumber } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const customers = readCustomerData();

        let agentId = body.agentId || '';
        let technicianId = body.technicianId || '';

        // Auto-assign if creator is restricted
        const user = getUserFromRequest(request);
        if (user) {
            try {
                if (user.isAgent) agentId = user.id;
                if (user.isTechnician) technicianId = user.id;
            } catch (e) {
                // Ignore
            }
        }

        let finalCustomerNumber = customerNumber;

        if (!finalCustomerNumber) {
            // Auto-generate customer number (Simple Integer starting from 10001)
            let maxId = 10000;
            for (const key in customers) {
                const cust = customers[key];
                if (cust.customerNumber) {
                    // Try to parse as integer
                    const numPart = parseInt(cust.customerNumber);
                    if (!isNaN(numPart) && numPart > maxId) {
                        maxId = numPart;
                    }
                }
            }
            finalCustomerNumber = String(maxId + 1);
        }

        customers[username] = {
            name: name || '',
            address: address || '',
            phone: phone || '',
            customerNumber: finalCustomerNumber,
            agentId: agentId,
            technicianId: technicianId
        };

        writeCustomerData(customers);
        return NextResponse.json({ success: true, customer: customers[username] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
