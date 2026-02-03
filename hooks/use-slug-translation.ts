"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { translateToEnglish } from "@/lib/actions/translation";
import { generateSlug } from "@/lib/utils/slug";
import { useToast } from "@/hooks/use-toast";

interface UseSlugTranslationProps {
    setValue: UseFormSetValue<any>;
    setAutoSlug: (value: boolean) => void;
    title: string;
    autoMode: boolean;
}

/**
 * Detects if text contains Hindi (Devanagari) characters.
 */
const isHindi = (text: string) => /[\u0900-\u097F]/.test(text);

/**
 * Smart hook for English slug generation.
 * Handles immediate slugging for English and debounced translation for Hindi headlines.
 */
export function useSlugTranslation({ setValue, setAutoSlug, title, autoMode }: UseSlugTranslationProps) {
    const [translating, setTranslating] = useState(false);
    const { toast } = useToast();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTranslatedText = useRef("");
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Auto-slug logic: Immediate for English, Debounced for Hindi
    useEffect(() => {
        if (!autoMode || !title || title.trim() === "") return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (isHindi(title)) {
            // Avoid translating the same text twice
            if (title.trim() === lastTranslatedText.current) return;

            // Debounce translation for Hindi (1.2s delay for stability)
            timeoutRef.current = setTimeout(async () => {
                setTranslating(true);
                const result = await translateToEnglish(title);
                if (isMounted.current) {
                    if (result.success && result.translatedText) {
                        const slug = generateSlug(result.translatedText, { maxLength: 200 });
                        setValue("slug", slug, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        lastTranslatedText.current = title.trim();
                    }
                    setTranslating(false);
                }
            }, 1200);
        } else {
            // Immediate slug for English/Latin text
            const slug = generateSlug(title, { maxLength: 200 });
            setValue("slug", slug, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [title, autoMode, setValue]);

    const handleManualTranslate = useCallback(async () => {
        if (!title || title.trim() === "") {
            toast({
                title: "Headline Required",
                description: "Please enter a headline first.",
                variant: "destructive"
            });
            return;
        }

        setTranslating(true);
        const result = await translateToEnglish(title);
        if (isMounted.current) {
            if (result.success && result.translatedText) {
                const slug = generateSlug(result.translatedText, { maxLength: 200 });
                setValue("slug", slug, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                setAutoSlug(false); // Lock the slug after manual translation
                lastTranslatedText.current = title.trim();
                toast({ title: "English Slug Generated" });
            } else {
                toast({
                    title: "Translation Failed",
                    description: result.error || "Could not generate English slug.",
                    variant: "destructive"
                });
            }
            setTranslating(false);
        }
    }, [title, setValue, setAutoSlug, toast]);

    return { translating, handleTranslate: handleManualTranslate };
}
