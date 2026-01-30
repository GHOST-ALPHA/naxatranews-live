export interface RashifalData {
    slug: string;
    name: string;
    englishName: string;
    icon: string;
    dateRange: string;
    color: string;
}

export const RASHIFAL_DATA: RashifalData[] = [
    {
        slug: "mesh",
        name: "मेष",
        englishName: "Aries",
        icon: "♈",
        dateRange: "Mar 21 - Apr 19",
        color: "from-red-500 to-red-600",
    },
    {
        slug: "vrish",
        name: "वृष",
        englishName: "Taurus",
        icon: "♉",
        dateRange: "Apr 20 - May 20",
        color: "from-green-500 to-emerald-600",
    },
    {
        slug: "mithun",
        name: "मिथुन",
        englishName: "Gemini",
        icon: "♊",
        dateRange: "May 21 - Jun 20",
        color: "from-yellow-400 to-amber-500",
    },
    {
        slug: "kark",
        name: "कर्क",
        englishName: "Cancer",
        icon: "♋",
        dateRange: "Jun 21 - Jul 22",
        color: "from-blue-400 to-blue-600",
    },
    {
        slug: "singh",
        name: "सिंह",
        englishName: "Leo",
        icon: "♌",
        dateRange: "Jul 23 - Aug 22",
        color: "from-orange-500 to-red-500",
    },
    {
        slug: "kanya",
        name: "कन्या",
        englishName: "Virgo",
        icon: "♍",
        dateRange: "Aug 23 - Sep 22",
        color: "from-emerald-500 to-green-600",
    },
    {
        slug: "tula",
        name: "तुला",
        englishName: "Libra",
        icon: "♎",
        dateRange: "Sep 23 - Oct 22",
        color: "from-indigo-400 to-indigo-600",
    },
    {
        slug: "vrishchik",
        name: "वृश्चिक",
        englishName: "Scorpio",
        icon: "♏",
        dateRange: "Oct 23 - Nov 21",
        color: "from-rose-500 to-pink-600",
    },
    {
        slug: "dhanu",
        name: "धनु",
        englishName: "Sagittarius",
        icon: "♐",
        dateRange: "Nov 22 - Dec 21",
        color: "from-amber-400 to-orange-500",
    },
    {
        slug: "makar",
        name: "मकर",
        englishName: "Capricorn",
        icon: "♑",
        dateRange: "Dec 22 - Jan 19",
        color: "from-cyan-600 to-blue-700",
    },
    {
        slug: "kumbh",
        name: "कुंभ",
        englishName: "Aquarius",
        icon: "♒",
        dateRange: "Jan 20 - Feb 18",
        color: "from-sky-400 to-blue-500",
    },
    {
        slug: "meen",
        name: "मीन",
        englishName: "Pisces",
        icon: "♓",
        dateRange: "Feb 19 - Mar 20",
        color: "from-violet-500 to-purple-600",
    }
];

export function getRashifalBySlug(slug: string) {
    return RASHIFAL_DATA.find((r) => r.slug === slug);
}
