import fs from "fs";
import path from "path";
import archiver from "archiver";
import { PassThrough } from "stream";

/**
 * Service to handle system backups (Media Assets)
 * Uses streaming to avoid high memory usage and temp files.
 */
export class BackupService {
    /**
     * Generates a backup stream
     * type: 'media'
     */
    static async createBackupStream(_type: 'media' = 'media'): Promise<NodeJS.ReadableStream> {

        console.log(`[BackupService] Starting ${_type} backup generation...`);
        const startTime = Date.now();

        const archive = archiver("zip", {
            zlib: { level: 0 }, // Level 0 is "Store" - no compression, maximum speed
        });

        const stream = new PassThrough();

        // Pipe archive data to the stream
        archive.pipe(stream);

        // Add Media Directory
        console.log(`[BackupService] Appending media assets...`);
        this.appendMediaDirectory(archive);

        archive.on('finish', () => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[BackupService] Backup stream finalized in ${duration}s`);
        });

        // Finalize the archive
        archive.finalize();

        return stream;
    }


    /**
     * Appends the media directory to the archive
     */
    private static appendMediaDirectory(archive: archiver.Archiver) {
        const mediaPath = path.join(process.cwd(), "public", "storage", "media");
        const thumbnailsPath = path.join(process.cwd(), "public", "storage", "thumbnails");

        // Check if directories exist before adding
        if (fs.existsSync(mediaPath)) {
            archive.directory(mediaPath, "media");
        } else {
            console.warn(`Media directory not found: ${mediaPath}`);
        }

        if (fs.existsSync(thumbnailsPath)) {
            archive.directory(thumbnailsPath, "thumbnails");
        } else {
            console.warn(`Thumbnails directory not found: ${thumbnailsPath}`);
        }
    }
}
