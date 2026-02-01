import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { BackupService } from "@/lib/services/backup-service";

// Prevent Vercel/Next.js from caching the response
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout for large backups

export async function GET(req: NextRequest) {
    try {
        // 1. Authentication & Authorization
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        // 2. Get Backup Type - Only media is supported for now
        const { searchParams } = new URL(req.url);
        const typeArg = searchParams.get("type") || "media";

        if (typeArg !== "media") {
            return NextResponse.json({ error: "Only media backup is currently supported" }, { status: 400 });
        }

        const type = "media";

        // 3. Generate Backup Stream
        const backupStream = await BackupService.createBackupStream(type);



        // 3. Create Response with Stream
        // We need to use the Web Streams API for Next.js App Router
        const stream = new ReadableStream({
            start(controller) {
                backupStream.on('data', (chunk) => {
                    try {
                        controller.enqueue(chunk);
                    } catch (e) {
                        // Controller might be closed
                    }
                });

                backupStream.on('end', () => {
                    try {
                        controller.close();
                    } catch (e) { }
                });

                backupStream.on('error', (err) => {
                    controller.error(err);
                });
            },
            cancel() {
                // If the request is cancelled, try to destroy the node stream
                if ('destroy' in backupStream && typeof backupStream.destroy === 'function') {
                    (backupStream as any).destroy();
                }
            }
        });


        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `naxatra-${type}-backup-${timestamp}.zip`;

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });


    } catch (error) {
        console.error("Backup API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
