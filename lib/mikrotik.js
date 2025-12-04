import { RouterOSAPI } from "node-routeros";
import { getConfig } from "./config";

// Map to store active clients: connectionId -> client
const clients = new Map();

export const getMikrotikClient = async (connectionId = null) => {
    // Always check for fresh config to handle updates
    const config = getConfig();

    // Determine which connection to use
    const targetId = connectionId || config.activeConnectionId;
    const activeConnection = config.connections?.find(c => c.id === targetId);

    // Fallback to env vars if no active connection (or for initial setup)
    const host = activeConnection?.host || process.env.MIKROTIK_HOST;
    const user = activeConnection?.user || process.env.MIKROTIK_USER;
    const password = activeConnection?.password || process.env.MIKROTIK_PASSWORD;
    const port = activeConnection?.port || process.env.MIKROTIK_PORT || 8728;

    if (!host || !user || !password) {
        throw new Error("Mikrotik credentials not configured");
    }

    // Check if we already have a client for this connection
    let client = clients.get(targetId || 'default');

    // If client exists but config changed or disconnected, close and reconnect
    if (client) {
        if (!client.connected) {
            // just reconnect
        } else if (
            client.host !== host ||
            client.port !== parseInt(port) ||
            client.user !== user
        ) {
            await client.close();
            client = null;
            clients.delete(targetId || 'default');
        }
    }

    if (!client) {
        client = new RouterOSAPI({
            host,
            user,
            password,
            port: parseInt(port),
            keepalive: true,
        });
        clients.set(targetId || 'default', client);
    }

    if (!client.connected) {
        try {
            await client.connect();
        } catch (error) {
            console.error(`Failed to connect to Mikrotik (${host}):`, error);
            throw error;
        }
    }

    return client;
};
