"use client";

import { cn } from "@/lib/utils";

interface CharacterCounterProps {
    current: number;
    max: number;
}

export function CharacterCounter({ current, max }: CharacterCounterProps) {
    return (
        <span className={cn("text-xs transition-colors font-medium",
            current > max ? "text-destructive" : "text-muted-foreground/60"
        )}>
            {current}/{max}
        </span>
    );
}
