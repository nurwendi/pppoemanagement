import fs from 'fs/promises';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const DATA_FILES = [
    'payments.json',
    'customer-data.json',
    'billing-settings.json',
    'users.json',
    'app-settings.json',
    'config.json',
    'olt-settings.json',
    'user-preferences.json'
];

// Ensure backup directory exists
function ensureBackupDir() {
    if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

/**
 * Create a backup of all data files
 * @returns {Promise<{filename: string, path: string}>}
 */
export async function createBackup() {
    ensureBackupDir();

    // Dynamically require archiver to avoid build issues
    const archiver = require('archiver');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.zip`;
    const backupPath = path.join(BACKUP_DIR, filename);

    return new Promise((resolve, reject) => {
        const output = createWriteStream(backupPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            resolve({
                filename,
                path: backupPath,
                size: archive.pointer()
            });
        });

        archive.on('error', (err) => {
            console.error('Archiver error:', err);
            reject(err);
        });

        archive.pipe(output);

        // Add each data file to the archive
        DATA_FILES.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            if (existsSync(filePath)) {
                archive.file(filePath, { name: file });
            }
        });

        archive.finalize();
    });
}

/**
 * List all available backups
 * @returns {Promise<Array<{filename: string, date: Date, size: number}>>}
 */
export async function listBackups() {
    ensureBackupDir();

    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backups = [];

        for (const file of files) {
            if (file.endsWith('.zip')) {
                const filePath = path.join(BACKUP_DIR, file);
                try {
                    const stats = await fs.stat(filePath);
                    backups.push({
                        filename: file,
                        date: stats.mtime,
                        size: stats.size
                    });
                } catch (err) {
                    console.error(`Error reading stats for ${file}:`, err);
                }
            }
        }

        // Sort by date, newest first
        backups.sort((a, b) => b.date - a.date);

        return backups;
    } catch (error) {
        console.error('Error listing backups:', error);
        return [];
    }
}

/**
 * Restore from a backup file
 * @param {string} filename - The backup filename
 * @returns {Promise<void>}
 */
export async function restoreBackup(filename) {
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!existsSync(backupPath)) {
        throw new Error('Backup file not found');
    }

    // First, create a safety backup of current state
    try {
        await createBackup();
    } catch (e) {
        console.warn('Failed to create safety backup:', e);
        // Continue anyway? Or fail? Let's continue but log it.
    }

    // Extract the backup using adm-zip
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(backupPath);
    const zipEntries = zip.getEntries();

    zipEntries.forEach((entry) => {
        const fileName = entry.entryName;

        // Only extract allowed data files
        if (DATA_FILES.includes(fileName)) {
            // Extract to current working directory
            // adm-zip extractEntryTo second arg is target path
            // We want to overwrite files in process.cwd()
            zip.extractEntryTo(entry, process.cwd(), false, true);
        }
    });
}

/**
 * Delete a backup file
 * @param {string} filename - The backup filename
 * @returns {Promise<void>}
 */
export async function deleteBackup(filename) {
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!existsSync(backupPath)) {
        throw new Error('Backup file not found');
    }

    await fs.unlink(backupPath);
}

/**
 * Get the path to a backup file
 * @param {string} filename - The backup filename
 * @returns {string}
 */
export function getBackupPath(filename) {
    // Prevent path traversal
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename) {
        throw new Error('Invalid filename');
    }
    return path.join(BACKUP_DIR, safeFilename);
}
