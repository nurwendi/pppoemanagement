const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

// 1. Reset System Users (Keep only admin)
const usersPath = path.join(dataDir, 'users.json');
try {
    if (fs.existsSync(usersPath)) {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const adminUser = users.find(u => u.username === 'admin');
        if (adminUser) {
            fs.writeFileSync(usersPath, JSON.stringify([adminUser], null, 2));
            console.log('Reset users.json (kept admin)');
        } else {
            console.log('Warning: Admin user not found in users.json');
        }
    }
} catch (e) {
    console.error('Error resetting users.json:', e);
}

// 2. Reset Config (Connections)
const configPath = path.join(rootDir, 'config.json');
const defaultConfig = {
    connections: [],
    activeConnectionId: null,
    title: "Mikrotik Manager",
    language: "en"
};
fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
console.log('Reset config.json');

// 3. Reset App Settings
const appSettingsPath = path.join(rootDir, 'app-settings.json');
const defaultAppSettings = {
    appName: "Mikrotik Manager",
    logoUrl: ""
};
fs.writeFileSync(appSettingsPath, JSON.stringify(defaultAppSettings, null, 2));
console.log('Reset app-settings.json');

// 4. Reset Customer Data
const customerDataPath = path.join(rootDir, 'customer-data.json');
fs.writeFileSync(customerDataPath, JSON.stringify({}, null, 2));
console.log('Reset customer-data.json');

// 5. Reset Payments
const paymentsPath = path.join(rootDir, 'payments.json');
fs.writeFileSync(paymentsPath, JSON.stringify([], null, 2));
console.log('Reset payments.json');

// 6. Reset Billing Payments
const billingPaymentsPath = path.join(rootDir, 'billing-payments.json');
fs.writeFileSync(billingPaymentsPath, JSON.stringify([], null, 2));
console.log('Reset billing-payments.json');

// 7. Reset Billing Settings
const billingSettingsPath = path.join(rootDir, 'billing-settings.json');
fs.writeFileSync(billingSettingsPath, JSON.stringify({}, null, 2));
console.log('Reset billing-settings.json');

// 8. Reset User Preferences
const userPreferencesPath = path.join(rootDir, 'user-preferences.json');
const defaultPreferences = {
    display: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        timezone: 'Asia/Jakarta',
        bandwidthUnit: 'auto',
        memoryUnit: 'auto',
        temperatureUnit: 'celsius'
    },
    dashboard: {
        refreshInterval: 5000
    },
    tables: {
        rowsPerPage: 25
    }
};
fs.writeFileSync(userPreferencesPath, JSON.stringify(defaultPreferences, null, 2));
console.log('Reset user-preferences.json');

console.log('Data reset complete.');
