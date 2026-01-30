import { Metadata } from "next"
import { StaticPageLayout } from "@/components/static-pages/static-page-layout"
import { staticPagesData } from "@/lib/data/static-pages"

export const metadata: Metadata = {
    title: "Join Our Team | Naxatra News Hindi",
    description: staticPagesData.careers.description,
    openGraph: {
        title: "Join Our Team | Naxatra News Hindi",
        description: staticPagesData.careers.description,
        type: "website",
    },
}

export default function CareersPage() {
    return (
        <StaticPageLayout
            title={staticPagesData.careers.title}
            description={staticPagesData.careers.description}
            sections={staticPagesData.careers.sections}
            lastUpdated={staticPagesData.careers.lastUpdated}
        />
    )
}
