
import { RashifalData } from "@/lib/data/rashifal-data";

export interface HoroscopeResponse {
    current_date: string;
    description: string;
    compatibility: string;
    mood: string;
    color: string;
    lucky_number: string;
    lucky_time: string;
}

// Fallback/Category Data Generators
const LOVE_PREDICTIONS = [
    "आज साथी के साथ अच्छा समय बीतेगा।",
    "पुराने मतभेद सुलझ सकते हैं।",
    "रिश्तों में नई ताजगी महसूस होगी।",
    "भावनात्मक रूप से मजबूत महसूस करेंगे।",
    "अपने साथी की भावनाओं का सम्मान करें।",
    "प्रेम जीवन में धैर्य बनाए रखें।",
    "आज कोई सरप्राइज मिल सकता है।"
];

const CAREER_PREDICTIONS = [
    "कार्यक्षेत्र में सफलता मिलेगी।",
    "नई जिम्मेदारियां मिल सकती हैं।",
    "सहकर्मियों का सहयोग मिलेगा।",
    "व्यापार में लाभ के योग हैं।",
    "आज का दिन नए निवेश के लिए शुभ है।",
    "कड़ी मेहनत का फल मिलेगा।",
    "आज काम का बोझ थोड़ा बढ़ सकता है।"
];

const HEALTH_PREDICTIONS = [
    "सेहत अच्छी रहेगी, ऊर्जावान महसूस करेंगे।",
    "हल्की थकान हो सकती है, आराम करें।",
    "मानसिक शांति के लिए योग करें।",
    "खान-पान का ध्यान रखें।",
    "आज आप फिट और स्वस्थ महसूस करेंगे।",
    "आंखों का ख्याल रखें।",
    "बाहर के खाने से परहेज करें।"
];

// Helper to get deterministic random index based on date and sign
function getDeterministicIndex(strArray: string[], dateStr: string, signSlug: string): number {
    const combined = dateStr + signSlug;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % strArray.length;
}

// Map Hindi/Sanskrit slugs to English signs for API
const SLUG_TO_ENGLISH: Record<string, string> = {
    "mesh": "aries",
    "vrish": "taurus",
    "mithun": "gemini",
    "kark": "cancer",
    "singh": "leo",
    "kanya": "virgo",
    "tula": "libra",
    "vrishchik": "scorpio",
    "dhanu": "sagittarius",
    "makar": "capricorn",
    "kumbh": "aquarius",
    "meen": "pisces"
};

export interface HoroscopePrediction {
    title: string;
    love: string;
    career: string;
    health: string;
    overall: string;
    meta: HoroscopeResponse;
}

export async function getHoroscope(slug: string): Promise<HoroscopePrediction> {
    const englishSign = SLUG_TO_ENGLISH[slug];
    if (!englishSign) {
        throw new Error("Invalid sign slug");
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Default/Fallback structure
    let apiData: Partial<HoroscopeResponse> = {};
    let overallPrediction = "आज का दिन आपके लिए मिला-जुला रहेगा। सकारात्मक सोच बनाए रखें।";

    try {
        const response = await fetch(`https://aztro.sameerkumar.website/?sign=${englishSign}&day=today`, {
            method: 'POST',
            cache: 'no-store' // Ensure fresh data
        });

        if (response.ok) {
            apiData = await response.json();
            // Aztro returns English content. We might want to use it or rely on our static generator for Hindi consistency.
            // For now, let's use the layout's "Overall" section to show the translated (or raw) text if needed, 
            // but the user prefers "logical daily change". 
            // Since Aztro is English, and the site is Hindi, let's stick to our deterministic Hindi generator for the main heavy text 
            // unless we integrate a translation service. 
            // However, we CAN use the "Lucky Color", "Lucky Number", "Mood" from Aztro directly as they are language-neutral or simple.
        }
    } catch (error) {
        console.error("Failed to fetch horoscope:", error);
    }

    // Generate deterministic Hindi predictions
    const love = LOVE_PREDICTIONS[getDeterministicIndex(LOVE_PREDICTIONS, today, slug)];
    const career = CAREER_PREDICTIONS[getDeterministicIndex(CAREER_PREDICTIONS, today, slug)];
    const health = HEALTH_PREDICTIONS[getDeterministicIndex(HEALTH_PREDICTIONS, today, slug)];

    // Use API description if available (maybe truncated/translated in future) or fallback
    // For now, we use deterministic "Overall" combined with API mood to make it semi-real
    overallPrediction = apiData.description
        ? `(English Insight: ${apiData.description}) आज का मूड: ${apiData.mood}`
        : "आज का दिन धैर्य और समझदारी से बिताने का है।";

    return {
        title: `आज का राशिफल: ${apiData.current_date || today}`,
        love,
        career,
        health,
        overall: overallPrediction,
        meta: {
            current_date: apiData.current_date || today,
            description: apiData.description || "",
            compatibility: apiData.compatibility || "Unknown",
            mood: apiData.mood || "Neutral",
            color: apiData.color || "Orange",
            lucky_number: apiData.lucky_number || "7",
            lucky_time: apiData.lucky_time || "12:00 PM"
        }
    };
}
