import { BackupManager } from "@/components/admin/settings/backup-manager";
import PageContainer from "@/components/layout/page-container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Backup | Admin Dashboard",
    description: "Manage system backups and data retention",
};

export default function BackupPage() {
    return (
        <PageContainer>
            <div className='flex flex-1 flex-col space-y-2'>
                <div>
                    <h1 className="text-3xl font-bold">System Maintenance</h1>
                    <p className="text-muted-foreground mt-2">
                        Perform administrative tasks like data backup and system health checks.
                    </p>
                </div>

                <BackupManager />
            </div>
        </PageContainer>

    );
}
