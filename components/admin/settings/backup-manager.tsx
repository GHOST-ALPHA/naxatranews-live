"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, ShieldCheck, FileImage, Sparkles, HardDrive } from "lucide-react";
import { toast } from "sonner";

export function BackupManager() {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadBackup = async () => {
        if (isLoading) return;

        const toastId = "media-backup-toast";
        try {
            setIsLoading(true);
            toast.loading("Initializing Media Snapshot...", { id: toastId });

            // Visual feedback delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const downloadUrl = `/api/admin/system/backup?type=media`;

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                toast.success("Media Snapshot started. Check your browser downloads.", {
                    id: toastId,
                    duration: 5000
                });
                setIsLoading(false);
            }, 3000);

        } catch (error) {
            console.error("Backup error:", error);
            toast.error("Cloud snapshot failed. Please check your connection.", { id: toastId });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Media Storage Archival
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
                    Securely snapshot your entire production media library into a portable archive.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left: Info & Stats */}
                <div className="md:col-span-5 space-y-6">
                    <Card className="border-none bg-gradient-to-br from-indigo-500/5 to-purple-500/5 shadow-none ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                                <Sparkles className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Premium Feature</span>
                            </div>
                            <CardTitle className="text-xl font-semibold">Snapshot Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <ShieldCheck className="h-3 w-3 text-green-600" />
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Includes all high-resolution article images and videos.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Optimized thumbnails for fast restoration are preserved.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <ShieldCheck className="h-3 w-3 text-purple-600" />
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Zero-impact streaming avoids server CPU spikes.
                                    </p>
                                </div>
                            </div>

                            <Alert className="bg-zinc-100/50 dark:bg-zinc-800/50 border-none">
                                <AlertDescription className="text-xs text-zinc-500 leading-relaxed italic">
                                    Note: Storage usage may vary. Ensure you have sufficient local disk space before starting the download.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: The Action Card */}
                <div className="md:col-span-7">
                    <Card className="relative overflow-hidden border-2 border-purple-100 dark:border-purple-900/30 shadow-2xl shadow-purple-500/10 h-full flex flex-col justify-center">
                        {/* Decorative Background Pattern */}
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <CardContent className="pt-8 pb-10 space-y-8 text-center">
                            <div className="mx-auto p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl w-fit shadow-lg shadow-purple-500/20">
                                <FileImage className="h-10 w-10 text-white" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight italic">Production Assets</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 px-8">
                                    A complete consolidated ZIP of <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-purple-600">/storage/media</code>
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-6 text-zinc-400">
                                <div className="flex flex-col items-center gap-1">
                                    <HardDrive className="h-4 w-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Streaming</span>
                                </div>
                                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                                <div className="flex flex-col items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Direct</span>
                                </div>
                            </div>

                            <div className="px-8">
                                <Button
                                    onClick={handleDownloadBackup}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-14 text-xl font-bold shadow-xl shadow-purple-500/25 transition-all active:scale-95 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Download className="h-6 w-6 group-hover:translate-y-0.5 transition-transform" />
                                            <span>Start Snapshot</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <p className="text-center text-[11px] text-zinc-400 font-medium">
                POWERED BY NAXATRA CORE INFRASTRUCTURE • © {new Date().getFullYear()}
            </p>
        </div>
    );
}
