import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

export const getConfig = () => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            const config = JSON.parse(data);

            // Migration: If legacy config (has host but no connections array)
            if (config.host && !config.connections) {
                const defaultId = Date.now().toString();
                return {
                    title: config.title,
                    activeConnectionId: defaultId,
                    connections: [{
                        id: defaultId,
                        name: 'Default Connection',
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password
                    }]
                };
            }

            // Ensure connections array exists
            if (!config.connections) {
                config.connections = [];
            }

            return config;
        }
    } catch (error) {
        console.error('Error reading config:', error);
    }
    return { connections: [], activeConnectionId: null };
};

export const saveConfig = (config) => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
};
