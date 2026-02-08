"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "sonner"

interface AutoSaveOptions<T> {
    key: string
    data: T
    enabled?: boolean
    debounceMs?: number
    isDirty?: boolean
    onLoad?: (data: T) => void
    shouldSave?: (data: T) => boolean
    validator?: (data: any) => data is T
}

export function useAutoSave<T>({
    key,
    data,
    enabled = true,
    debounceMs = 1500,
    isDirty = false,
    onLoad,
    shouldSave,
    validator,
}: AutoSaveOptions<T>) {
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const isLoaded = useRef(false)
    const lastSavedString = useRef<string | null>(null)

    // 1. Initial Load Logic
    useEffect(() => {
        if (isLoaded.current) return

        try {
            if (typeof window === "undefined") return;

            const saved = localStorage.getItem(key)
            if (saved) {
                const parsed = JSON.parse(saved)

                // SAFETY CHECK: Don't restore if the user already started typing
                if (isDirty) {
                    console.warn("AutoSave: Skipping restoration because form is already dirty.")
                    return
                }

                // VALIDATION: Ensure data matches expected schema
                const isValid = validator ? validator(parsed) : !!parsed;

                if (isValid && (!shouldSave || shouldSave(parsed))) {
                    if (onLoad) {
                        onLoad(parsed)
                        toast.success("Draft Restored", {
                            description: "Content recovered from localized storage.",
                            duration: 4000,
                            icon: "📝",
                        })
                    }
                } else if (!isValid) {
                    // If data is invalid (e.g. old schema), better to clear it
                    console.warn("AutoSave: Stale or invalid draft found, clearing.")
                    localStorage.removeItem(key)
                }
            }
        } catch (e) {
            console.error("AutoSave: Failed to load draft", e)
        } finally {
            isLoaded.current = true
            setIsLoading(false)
        }
    }, [key, onLoad, shouldSave, validator, isDirty])

    // 2. Continuous Saving Logic
    useEffect(() => {
        if (!enabled || !isLoaded.current) return

        const handler = setTimeout(() => {
            try {
                // Only save if data is "meaningful"
                if (shouldSave && !shouldSave(data)) {
                    // If the page is now empty, but we had a draft, we might want to preserve it
                    // OR if the user manually cleared EVERYTHING, we might want to clear the draft.
                    // For safety in production, we'll only SAVE if meaningful.
                    return
                }

                const stringified = JSON.stringify(data)

                // Deep compare (via string) to avoid redundant localStorage writes
                if (stringified === lastSavedString.current) {
                    return
                }

                localStorage.setItem(key, stringified)
                lastSavedString.current = stringified
                setLastSaved(new Date())
            } catch (e) {
                console.error("AutoSave: Failed to save draft", e)
            }
        }, debounceMs)

        return () => clearTimeout(handler)
    }, [data, key, enabled, debounceMs, shouldSave])

    const clearDraft = useCallback(() => {
        localStorage.removeItem(key)
        lastSavedString.current = null
        setLastSaved(null)
    }, [key])

    return { lastSaved, clearDraft, isLoading }
}
