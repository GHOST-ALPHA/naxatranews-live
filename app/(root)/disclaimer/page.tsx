import { Metadata } from "next"
import { StaticPageLayout } from "@/components/static-pages/static-page-layout"
import { staticPagesData } from "@/lib/data/static-pages"

export const metadata: Metadata = {
    title: "Disclaimer | Naxatra News Hindi",
    description: staticPagesData.disclaimer.description,
    openGraph: {
        title: "Disclaimer | Naxatra News Hindi",
        description: staticPagesData.disclaimer.description,
        type: "website",
    },
}

export default function DisclaimerPage() {
    return (
        <StaticPageLayout
            title={staticPagesData.disclaimer.title}
            description={staticPagesData.disclaimer.description}
            sections={staticPagesData.disclaimer.sections}
            lastUpdated={staticPagesData.disclaimer.lastUpdated}
        />
    )
}
