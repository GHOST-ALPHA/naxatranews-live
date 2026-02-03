/**
 * Shared utility for deterministic Rashifal generation.
 * Layered with authentic Hindu astrology concepts for variety and depth.
 */

export const PLANETS = ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"];
export const NAKSHATRAS = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा"];
export const TITHIS = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी"];

export const VEDIC_REMEDIES = [
    "आज तांबे के लोटे से सूर्य को जल अर्पित करें।",
    "गाय को हरा चारा खिलाएं, मानसिक शांति मिलेगी।",
    "हनुमान चालीसा का पाठ करना शुभ रहेगा।",
    "पक्षियों को दाना डालें, भाग्योदय होगा।",
    "कुलदेवता का स्मरण करें और सफेद चंदन का तिलक लगाएं।",
    "गरीबों को अन्न दान करें, बाधाएं दूर होंगी।",
    "महामृत्युंजय मंत्र का 11 बार जाप करें।",
    "गणेश जी को दूर्वा अर्पित करें, कार्य सिद्ध होंगे।",
    "शिवलिंग पर कच्चा दूध चढ़ाएं।"
];

export const ASTRO_INSIGHTS = [
    "ग्रहों की स्थिति अनुकूल है, नए कार्यों में हाथ डालें।",
    "चंद्रमा का गोचर मन को विचलित कर सकता है, ध्यान लगाएं।",
    "गुरु की कृपा से धन आगमन के योग बन रहे हैं।",
    "शनि की ढैया/साढ़ेसाती का प्रभाव कम होगा, धैर्य रखें।",
    "मंगल की ऊर्जा आपके साहस में वृद्धि करेगी।",
    "बुध की स्थिति व्यापारिक निर्णय लेने के लिए उत्तम है।",
    "शुक्र का प्रभाव प्रेम संबंधों में प्रगाढ़ता लाएगा।",
    "राहु की स्थिति भ्रम पैदा कर सकती है, विवादों से बचें।",
    "केतु का प्रभाव आध्यात्मिक उन्नति का मार्ग प्रशस्त करेगा।"
];

export const RASHIFAL_FORTUNES = [
    "आज का दिन नई ऊर्जा लेकर आएगा। रुके हुए काम पूरे होंगे।",
    "स्वास्थ्य के प्रति सचेत रहें। परिवार के साथ समय बिताना सुखद रहेगा।",
    "कार्यक्षेत्र में सराहना मिलेगी। आर्थिक लाभ के योग बन रहे हैं।",
    "वाणी पर संयम रखें, विवाद टलेंगे। धैर्य से काम लेना लाभदायक होगा।",
    "नए निवेश के लिए शुभ समय है। मित्रों का भरपूर सहयोग मिलेगा।",
    "मानसिक शांति के लिए योग करें। खुशखबरी मिल सकती है।",
    "व्यापार में वृद्धि होगी। सामाजिक कार्यों में रुचि बढ़ेगी।",
    "रिश्तों में मधुरता आएगी। यात्रा के सुखद योग बन रहे हैं।",
    "दिन मिला-जुला रहेगा। मेहनत का फल अवश्य मिलेगा।",
    "आर्थिक स्थिति मजबूत होगी। मान-सम्मान में वृद्धि होगी।"
];

export function getDeterministicHash(dateStr: string, signSlug: string, layer: string = "default"): number {
    const combined = dateStr + signSlug + layer;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/**
 * Generates an authentic, complex daily prediction by layering different tokens.
 * This creates thousands of unique daily permutations (Insigh + Fortune + Remedy).
 */
export function getDailyPrediction(slug: string): string {
    const today = new Date().toISOString().split('T')[0];

    const insightHash = getDeterministicHash(today, slug, "insight");
    const fortuneHash = getDeterministicHash(today, slug, "fortune");
    const remedyHash = getDeterministicHash(today, slug, "remedy");

    const insight = ASTRO_INSIGHTS[insightHash % ASTRO_INSIGHTS.length];
    const fortune = RASHIFAL_FORTUNES[fortuneHash % RASHIFAL_FORTUNES.length];
    const remedy = VEDIC_REMEDIES[remedyHash % VEDIC_REMEDIES.length];

    return `${insight} ${fortune} उपाय: ${remedy}`;
}

export function getAuthenticTokens(slug: string) {
    const today = new Date().toISOString().split('T')[0];
    const h = getDeterministicHash(today, slug, "tokens");

    return {
        planet: PLANETS[h % PLANETS.length],
        nakshatra: NAKSHATRAS[(h + 3) % NAKSHATRAS.length],
        tithi: TITHIS[(h + 7) % TITHIS.length]
    };
}
