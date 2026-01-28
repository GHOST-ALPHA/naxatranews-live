"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface GooglePreviewProps {
    title: string;
    description: string;
    slug: string;
    date?: string;
    minHeight?: boolean;
}

export function GooglePreview({
    title,
    description,
    slug,
    date,
    minHeight = false
}: GooglePreviewProps) {
    // Mock domain for preview
    const domain = "bawalnews.com";
    // Truncate function
    const truncate = (str: string, length: number) => {
        if (!str) return "";
        return str.length > length ? str.substring(0, length) + "..." : str;
    };

    const previewTitle = truncate(title || "Your News Title Here", 60);
    const previewDesc = truncate(description || "Your meta description will appear here. It should be descriptive and entice users to click.", 160);
    const previewUrl = `${domain} › news › ${truncate(slug || "your-optimized-slug", 40)}`;

    return (
        <div className={`space-y-2 ${minHeight ? 'min-h-[140px]' : ''}`}>
            <div className="font-sans max-w-[600px] break-words bg-card rounded-lg p-4 border border-border/50 bg-muted/20">
                {/* Mobile/Modern View Header */}
                <div className="flex items-center gap-3 mb-2 group cursor-pointer">
                    <div className="bg-muted rounded-full w-7 h-7 flex items-center justify-center border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground">B</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm text-foreground/90 font-medium">Bawal News</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{previewUrl}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer leading-tight mb-1">
                    {previewTitle}
                </h3>

                {/* Description */}
                <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
                    {date && (
                        <span className="text-muted-foreground mr-1">
                            {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} —
                        </span>
                    )}
                    {previewDesc}
                </div>
            </div>
        </div>
    );
}
