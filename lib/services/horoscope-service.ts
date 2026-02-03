import { getDeterministicHash, RASHIFAL_FORTUNES, getDailyPrediction, ASTRO_INSIGHTS, VEDIC_REMEDIES, getAuthenticTokens } from "@/lib/utils/rashifal-utils";

export interface HoroscopePrediction {
    title: string;
    love: string;
    career: string;
    health: string;
    overall: string;
    authentic: {
        planet: string;
        nakshatra: string;
        tithi: string;
        remedy: string;
    };
    meta: {
        current_date: string;
        color: string;
        lucky_number: string;
        mood: string;
        description: string;
    };
}

const COLORS = ["लाल", "पीला", "सफ़ेद", "नीला", "हरा", "नारंगी", "गुलाबी"];
const MOODS = ["खुशमिजाज", "शांत", "ऊर्जावान", "रचनात्मक", "चिंतनशील"];

export async function getHoroscope(slug: string): Promise<HoroscopePrediction> {
    const today = new Date().toISOString().split('T')[0];
    const hindiDate = new Date().toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const tokens = getAuthenticTokens(slug);
    const hash = getDeterministicHash(today, slug);

    // Layered generation for detail sections
    const loveHash = getDeterministicHash(today + "love", slug);
    const careerHash = getDeterministicHash(today + "career", slug);
    const healthHash = getDeterministicHash(today + "health", slug);

    return {
        title: `आज का राशिफल (${hindiDate})`,
        love: RASHIFAL_FORTUNES[loveHash % RASHIFAL_FORTUNES.length],
        career: RASHIFAL_FORTUNES[careerHash % RASHIFAL_FORTUNES.length],
        health: RASHIFAL_FORTUNES[healthHash % RASHIFAL_FORTUNES.length],
        overall: getDailyPrediction(slug),
        authentic: {
            ...tokens,
            remedy: VEDIC_REMEDIES[hash % VEDIC_REMEDIES.length]
        },
        meta: {
            current_date: today,
            color: COLORS[hash % COLORS.length],
            lucky_number: ((hash % 9) + 1).toString(),
            mood: MOODS[hash % MOODS.length],
            description: RASHIFAL_FORTUNES[hash % RASHIFAL_FORTUNES.length]
        }
    };
}
