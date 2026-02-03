import type React from "react"
import { NewsSidebar } from "@/components/news/sidebar"
import { AdFooter } from "@/components/ads/ad-footer"
import { AdHeader } from "@/components/ads/ad-header"

// Standard layout for author pages matching the category listing design
export default function AuthorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="">
            {/* Top Banner Ad - Zone: header, Position: 0 */}
            <AdHeader
                className="w-full"
                showDefault={true}
            />


            <main className="max-w-[90rem] justify-center mx-auto px-2 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area (Left 75% - per requirement) */}
                    <div className="w-full lg:w-3/4">{children}</div>

                    {/* Feature Sidebar (Right 25% - per requirement) */}
                    <div className="w-full lg:w-1/4 space-y-8">
                        <NewsSidebar />
                    </div>
                </div>
            </main>

            {/* Footer Ad - Zone: footer, Position: 0 */}
            <AdFooter
                className="w-full my-8"
                showDefault={true}
                position={0}
            />
        </div>
    )
}
