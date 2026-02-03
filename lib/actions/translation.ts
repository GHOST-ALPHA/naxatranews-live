"use server";

/**
 * Translates text to English using a free Google Translate endpoint.
 * This is used for generating English slugs from Hindi headlines.
 */
export async function translateToEnglish(text: string): Promise<{ success: boolean; translatedText?: string; error?: string }> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    // Sanitize input: remove extra whitespace and newlines for better translation quality
    const sanitizedText = text.trim().replace(/\s+/g, " ");

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(sanitizedText)}`;

        // Create an AbortController for a 10s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
            signal: controller.signal,
            next: { revalidate: 3600 }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 429) {
                return { success: false, error: "Too many translation requests. Please try again later." };
            }
            throw new Error(`Translation service error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data[0]) {
            // Free API can return multiple segments for long text
            const translatedText = data[0]
                .map((item: any) => item?.[0] || "")
                .filter(Boolean)
                .join("")
                .trim();

            if (!translatedText) throw new Error("Received empty translation");

            return { success: true, translatedText };
        }

        return { success: false, error: "Could not parse translation result" };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: "Translation timed out. Please check your connection." };
        }
        console.error("Translation server error:", error);
        return { success: false, error: "Service temporarily unavailable" };
    }
}
