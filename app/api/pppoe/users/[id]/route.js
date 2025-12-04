import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/mikrotik';

export async function PUT(request, { params }) {
    try {
        const client = await getMikrotikClient();
        const { id } = await params;
        const body = await request.json();
        const { name, password, profile, service, comment } = body;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const updateParams = [`=.id=${id}`];
        if (name) updateParams.push(`=name=${name}`);
        if (password) updateParams.push(`=password=${password}`);
        if (profile) updateParams.push(`=profile=${profile}`);
        if (service) updateParams.push(`=service=${service}`);
        if (comment) updateParams.push(`=comment=${comment}`);

        await client.write('/ppp/secret/set', updateParams);

        // Disconnect user from active connections to apply changes immediately
        // We need the username to find the active connection
        let userName = name;
        if (!userName) {
            // If name wasn't updated, fetch the current name using the ID
            const currentUser = await client.write('/ppp/secret/print', [`?.id=${id}`]);
            if (currentUser && currentUser.length > 0) {
                userName = currentUser[0].name;
            }
        }

        if (userName) {
            const activeConnections = await client.write('/ppp/active/print', [`?name=${userName}`]);
            if (activeConnections && activeConnections.length > 0) {
                for (const conn of activeConnections) {
                    await client.write('/ppp/active/remove', [`=.id=${conn['.id']}`]);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const client = await getMikrotikClient();
        const { id } = await params;

        console.log(`Attempting to delete user with ID: ${id}`);

        await client.write('/ppp/secret/remove', [
            `=.id=${id}`,
        ]);

        console.log(`Successfully deleted user with ID: ${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting user with ID ${params.id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
