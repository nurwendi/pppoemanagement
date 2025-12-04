import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';
import fs from 'fs';
import path from 'path';

const CUSTOMER_DATA_PATH = path.join(process.cwd(), 'customer-data.json');

function readCustomerData() {
    if (!fs.existsSync(CUSTOMER_DATA_PATH)) {
        return {};
    }
    const data = fs.readFileSync(CUSTOMER_DATA_PATH, 'utf-8');
    return JSON.parse(data);
}

function writeCustomerData(data) {
    fs.writeFileSync(CUSTOMER_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request) {
    try {
        const client = await getMikrotikClient();
        const users = await client.write('/ppp/secret/print');
        const customers = readCustomerData();

        // Find current max customer number
        let maxId = 10000;
        for (const key in customers) {
            const cust = customers[key];
            if (cust.customerNumber) {
                const numPart = parseInt(cust.customerNumber);
                if (!isNaN(numPart) && numPart > maxId) {
                    maxId = numPart;
                }
            }
        }

        let updatedCount = 0;

        for (const user of users) {
            const username = user.name;

            // Check if user needs a customer number
            if (!customers[username] || !customers[username].customerNumber) {
                // Generate new number
                maxId++;
                const newCustomerNumber = String(maxId);

                // Initialize customer object if missing
                if (!customers[username]) {
                    customers[username] = {
                        name: '',
                        address: '',
                        phone: '',
                        agentId: '',
                        technicianId: ''
                    };
                }

                customers[username].customerNumber = newCustomerNumber;
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            writeCustomerData(customers);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully generated customer numbers for ${updatedCount} users.`,
            updatedCount
        });

    } catch (error) {
        console.error('Failed to generate missing customer numbers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
