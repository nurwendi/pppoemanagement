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

export async function GET(request) {
    try {
        const customers = readCustomerData();
        const pending = [];

        for (const [key, val] of Object.entries(customers)) {
            if (val.status === 'pending') {
                pending.push({
                    username: key,
                    ...val
                });
            }
        }

        return NextResponse.json(pending);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, action, updatedData, type, targetUsername, newValues, agentId } = body;
        // action: 'approve', 'reject', or 'submit' (implicit if type is present)

        const customers = readCustomerData();

        // --- SUBMIT REQUEST (Register, Edit, Delete) ---
        if (type) {
            if (type === 'register') {
                // Existing registration logic
                if (customers[username]) {
                    return NextResponse.json({ error: "Username already exists or pending" }, { status: 400 });
                }
                customers[username] = {
                    status: 'pending',
                    type: 'register',
                    name: body.name,
                    address: body.address,
                    phone: body.phone,
                    agentId: agentId,
                    registrationData: {
                        name: username,
                        password: body.password,
                        profile: body.profile,
                        service: body.service,
                        comment: body.comment
                    },
                    timestamp: new Date().toISOString()
                };
                writeCustomerData(customers);
                return NextResponse.json({ success: true, message: "Registration submitted for approval" });

            } else if (type === 'edit' || type === 'delete') {
                if (!targetUsername) {
                    return NextResponse.json({ error: "Target username is required" }, { status: 400 });
                }

                // Create a unique key for the request
                const requestKey = `req_${Date.now()}_${targetUsername}`;

                customers[requestKey] = {
                    status: 'pending',
                    type: type,
                    targetUsername: targetUsername,
                    agentId: agentId,
                    newValues: newValues, // For edit
                    name: body.name || targetUsername, // For display
                    timestamp: new Date().toISOString()
                };

                writeCustomerData(customers);
                return NextResponse.json({ success: true, message: `${type === 'edit' ? 'Edit' : 'Delete'} request submitted for approval` });
            }
        }

        // --- APPROVE / REJECT ---
        if (!username || !action) {
            return NextResponse.json({ error: "Username (Request ID) and action are required" }, { status: 400 });
        }

        const requestEntry = customers[username]; // username here is the key (could be requestKey)

        if (!requestEntry || requestEntry.status !== 'pending') {
            return NextResponse.json({ error: "Request not found or not pending" }, { status: 404 });
        }

        if (action === 'reject') {
            delete customers[username];
            writeCustomerData(customers);
            return NextResponse.json({ success: true, message: "Request rejected" });
        }

        if (action === 'approve') {
            const requestType = requestEntry.type || 'register'; // Default to register for backward compatibility

            if (requestType === 'register') {
                const { updatedData } = body;
                let customer = requestEntry; // Use requestEntry as customer object

                // Apply updates if provided
                if (updatedData) {
                    if (updatedData.name) customer.name = updatedData.name;
                    if (updatedData.address) customer.address = updatedData.address;
                    if (updatedData.phone) customer.phone = updatedData.phone;
                    if (updatedData.agentId) customer.agentId = updatedData.agentId;

                    if (customer.registrationData) {
                        if (updatedData.username && updatedData.username !== customer.registrationData.name) {
                            const newUsername = updatedData.username;
                            if (customers[newUsername]) {
                                return NextResponse.json({ error: "New username already exists" }, { status: 400 });
                            }
                            customers[newUsername] = { ...customer };
                            delete customers[username];
                            customer = customers[newUsername]; // Update reference
                            customer.registrationData.name = newUsername;
                        }
                        if (updatedData.password) customer.registrationData.password = updatedData.password;
                        if (updatedData.profile) customer.registrationData.profile = updatedData.profile;
                        if (updatedData.service) customer.registrationData.service = updatedData.service;
                    }
                }

                const { registrationData } = customer;
                if (!registrationData) return NextResponse.json({ error: "Missing registration data" }, { status: 500 });

                const { name, password, profile, service, routerIds, comment } = registrationData;

                // Create in Mikrotik
                const targetRouterIds = (routerIds && Array.isArray(routerIds) && routerIds.length > 0) ? routerIds : [null];
                const results = [];
                const errors = [];

                for (const routerId of targetRouterIds) {
                    try {
                        const client = await getMikrotikClient(routerId);
                        const command = [
                            `=name=${name}`,
                            `=password=${password}`,
                            `=profile=${profile || ''}`,
                            `=service=${service || 'pppoe'}`,
                        ];
                        if (comment) command.push(`=comment=${comment}`);
                        await client.write('/ppp/secret/add', command);
                        results.push({ routerId, success: true });
                    } catch (err) {
                        console.error(`Failed to add user to router ${routerId}:`, err);
                        errors.push({ routerId, error: err.message });
                    }
                }

                if (errors.length > 0 && results.length === 0) {
                    return NextResponse.json({ error: "Failed to create user in Mikrotik", details: errors }, { status: 500 });
                }

                // Update customer status to active
                delete customer.status;
                delete customer.registrationData;
                delete customer.type; // Remove type
                delete customer.timestamp;
                writeCustomerData(customers);

                return NextResponse.json({ success: true, message: "Registration approved and user created" });

            } else if (requestType === 'edit') {
                const { targetUsername, newValues } = requestEntry;
                // Apply updatedData from review if any (Admin might have changed the edit request)
                const finalValues = { ...newValues, ...updatedData };

                // Update Mikrotik
                try {
                    const client = await getMikrotikClient();
                    // Find user ID by name
                    const users = await client.write('/ppp/secret/print', [`?name=${targetUsername}`]);
                    if (users.length === 0) {
                        throw new Error(`User ${targetUsername} not found in Mikrotik`);
                    }
                    const userId = users[0]['.id'];

                    const updateParams = [`=.id=${userId}`];
                    if (finalValues.username && finalValues.username !== targetUsername) updateParams.push(`=name=${finalValues.username}`);
                    if (finalValues.password) updateParams.push(`=password=${finalValues.password}`);
                    if (finalValues.profile) updateParams.push(`=profile=${finalValues.profile}`);
                    if (finalValues.service) updateParams.push(`=service=${finalValues.service}`);

                    await client.write('/ppp/secret/set', updateParams);

                    // Disconnect to apply changes
                    const activeConnections = await client.write('/ppp/active/print', [`?name=${targetUsername}`]);
                    for (const conn of activeConnections) {
                        await client.write('/ppp/active/remove', [`=.id=${conn['.id']}`]);
                    }

                } catch (err) {
                    return NextResponse.json({ error: "Failed to update Mikrotik: " + err.message }, { status: 500 });
                }

                // Update Customer Data
                const activeCustomer = customers[targetUsername];
                if (activeCustomer) {
                    if (finalValues.name) activeCustomer.name = finalValues.name;
                    if (finalValues.address) activeCustomer.address = finalValues.address;
                    if (finalValues.phone) activeCustomer.phone = finalValues.phone;
                    if (finalValues.agentId) activeCustomer.agentId = finalValues.agentId;

                    // Handle username change in customer data key
                    if (finalValues.username && finalValues.username !== targetUsername) {
                        customers[finalValues.username] = activeCustomer;
                        delete customers[targetUsername];
                    }
                }

                // Delete Request
                delete customers[username];
                writeCustomerData(customers);

                return NextResponse.json({ success: true, message: "Edit request approved and executed" });

            } else if (requestType === 'delete') {
                const { targetUsername } = requestEntry;

                // Delete from Mikrotik
                try {
                    const client = await getMikrotikClient();
                    const users = await client.write('/ppp/secret/print', [`?name=${targetUsername}`]);
                    if (users.length > 0) {
                        await client.write('/ppp/secret/remove', [`=.id=${users[0]['.id']}`]);
                    }
                } catch (err) {
                    // Log but continue to clean up customer data
                    console.error("Failed to delete from Mikrotik:", err);
                }

                // Delete Customer Data
                if (customers[targetUsername]) {
                    delete customers[targetUsername];
                }

                // Delete Request
                delete customers[username];
                writeCustomerData(customers);

                return NextResponse.json({ success: true, message: "Delete request approved and executed" });
            }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error('Registration action error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
