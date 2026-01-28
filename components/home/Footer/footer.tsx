
import { SocialIcons } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Footer() {
    const company = [
        {
            title: "About Us",
            href: "/about",
        },
        {
            title: "Contact Us",
            href: "/contact",
        },
        {
            title: "Advertising",
            href: "/ads",
        },
        {
            title: "Privacy Policy",
            href: "/privacy",
        },
        {
            title: "Terms & Conditions",
            href: "/terms",
        },
        {
            title: "DMCA",
            href: "/dmca",
        },
        {
            title: "Cookie Policy",
            href: "/cookies",
        },
    ];

    const resources = [
        {
            title: "Search",
            href: "/search",
        },
        {
            title: "Contact Support",
            href: "/contact",
        },
        {
            title: "Advertising",
            href: "/ads",
        },
    ];


    return (
        <footer className="relative bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529]">
            <div
                className={cn(
                    "mx-auto max-w-7xl lg:border-x ",
                    "dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]"
                )}
            >
                <div className="absolute inset-x-0 h-px w-full bg-border" />
                <div className="grid max-w-7xl grid-cols-6 gap-6 p-4">
                    <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
                        <a className="w-max" href="/">
                            <Image src="/logo/logo.png" alt="Bawal_News" width={110} height={110} />
                        </a>
                        <p className="max-w-sm text-balance text-white text-sm">
                            Stay informed with the latest Hindi news, breaking updates, and featured stories from around the world.
                        </p>
                        <p className="text-white text-xs">Bawal News - Your trusted source for news and information.</p>
                        <div className="flex gap-2">
                            <SocialIcons size="sm" />
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-white text-xs">Resources</span>
                        <div className="mt-2 flex flex-col gap-2 ">
                            {resources.map(({ href, title }) => (
                                <a
                                    className="w-max text-sm hover:underline text-white"
                                    href={href}
                                    key={title}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-white text-xs">Company</span>
                        <div className="mt-2 flex flex-col gap-2">
                            {company.map(({ href, title }) => (
                                <a
                                    className="w-max text-sm hover:underline text-white"
                                    href={href}
                                    key={title}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-0 h-px w-full bg-border" />
                <div className="flex max-w-7xl flex-col justify-between gap-2 py-6 px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-center md:text-left font-light text-white text-sm">
                            &copy; {new Date().getFullYear()} Bawal News. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white">
                            <a href="/rss.xml" className="hover:underline transition-colors">RSS Feed</a>
                            <span>•</span>
                            <a href="/sitemap.xml" className="hover:underline transition-colors">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
