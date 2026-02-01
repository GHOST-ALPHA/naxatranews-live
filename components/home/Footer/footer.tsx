import { SocialIcons } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, ChevronRight } from "lucide-react";

export function Footer() {
    const companyLinks = [
        { title: "About Us", href: "/about" },
        { title: "Contact Us", href: "/contact" },
        { title: "Join Our Team", href: "/careers" },
        { title: "Privacy Policy", href: "/privacy" },
        // { title: "Cookie Policy", href: "/cookies" },
        // { title: "Disclaimer", href: "/disclaimer" },
        // { title: "DMCA Policy", href: "/dmca" },
        // { title: "Grievance Redressal", href: "/grievance" },
    ];

    const categories = [
        { title: "Politics", href: "/rajneeti" },
        { title: "Jharkhand", href: "/jharkhand" },
        { title: "Bihar", href: "/bihar" },
        { title: "Business", href: "/vyapar" },
        { title: "Entertainment", href: "/manoranjan" },
        { title: "Sports", href: "/khel" },
    ];

    return (
        <footer className="relative bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529] text-white pt-10 md:pt-16 pb-8 border-t-4 border-red-600">
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div> */}

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
                    {/* Column 1: Brand Info */}
                    <div className="space-y-4 md:space-y-6">
                        <Link href="/" className="block w-max">
                            <div className="flex items-center gap-2.5 md:gap-3">
                                <Image src="/logo/logo.png" alt="Naxatra News" width={60} height={60} className="object-contain w-10 h-10 md:w-[60px] md:h-[60px]" />
                                <div className="flex flex-col">
                                    <span className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-none text-white">Naxatra</span>
                                    <span className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-none text-red-500">News</span>
                                </div>
                            </div>
                        </Link>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-sm opacity-90">
                            Naxatra News brings you the latest and most credible news from Jharkhand, Bihar, and across the nation. We are committed to truth and transparency.
                        </p>
                        <div className="pt-2">
                            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 md:mb-3">Follow Us</h4>
                            <SocialIcons size="sm" />
                        </div>
                    </div>

                    {/* Column 2 & 3: Links (Side-by-side on Mobile, Col 2+3 on Desktop) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
                        {/* Quick Links */}
                        <div>
                            <h3 className="text-sm md:text-lg font-bold uppercase tracking-wider mb-4 md:mb-6 text-red-100 border-b border-red-600/30 inline-block pb-1">Company</h3>
                            <ul className="space-y-2 md:space-y-3">
                                {companyLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            prefetch={false}
                                            className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm flex items-center group"
                                        >
                                            <ChevronRight className="h-3 w-3 mr-1.5 md:mr-2 text-red-600 opacity-100 md:opacity-0 md:-ml-5 md:group-hover:opacity-100 md:group-hover:ml-0 transition-all duration-300" />
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm md:text-lg font-bold uppercase tracking-wider mb-4 md:mb-6 text-red-100 border-b border-red-600/30 inline-block pb-1">Categories</h3>
                            <ul className="space-y-2 md:space-y-3">
                                {categories.map((cat) => (
                                    <li key={cat.href}>
                                        <Link
                                            href={cat.href}
                                            prefetch={false}
                                            className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm flex items-center group"
                                        >
                                            <ChevronRight className="h-3 w-3 mr-1.5 md:mr-2 text-red-600 opacity-100 md:opacity-0 md:-ml-5 md:group-hover:opacity-100 md:group-hover:ml-0 transition-all duration-300" />
                                            {cat.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div>
                        <h3 className="text-sm md:text-lg font-bold uppercase tracking-wider mb-4 md:mb-6 text-red-100 border-b border-red-600/30 inline-block pb-1">Get in Touch</h3>
                        <ul className="space-y-3 md:space-y-5">
                            <li className="flex items-start gap-3 text-xs md:text-sm text-gray-400 group">
                                <div className="p-1.5 md:p-2 rounded-full bg-white/5 group-hover:bg-red-600/10 transition-colors shrink-0 mt-0.5 md:mt-0">
                                    <MapPin className="h-3.5 w-3.5 md:h-5 md:w-5 text-red-500" />
                                </div>
                                <span className="leading-relaxed">Main Road, Ranchi,<br />Jharkhand - 834001</span>
                            </li>
                            <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 group">
                                <div className="p-1.5 md:p-2 rounded-full bg-white/5 group-hover:bg-red-600/10 transition-colors shrink-0">
                                    <Mail className="h-3.5 w-3.5 md:h-5 md:w-5 text-red-500" />
                                </div>
                                <a href="mailto:contact@naxatranews.com" className="hover:text-white transition-colors">contact@naxatranews.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 group">
                                <div className="p-1.5 md:p-2 rounded-full bg-white/5 group-hover:bg-red-600/10 transition-colors shrink-0">
                                    <Phone className="h-3.5 w-3.5 md:h-5 md:w-5 text-red-500" />
                                </div>
                                <a href="tel:+911234567890" className="hover:text-white transition-colors">+91 1234 567 890</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-white/10 pt-6 md:pt-8 mt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-gray-400">
                    <p className="text-center md:text-left order-2 md:order-1">&copy; {new Date().getFullYear()} Naxatra News. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 order-1 md:order-2">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                        <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
                        <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Made with</span>
                        <span className="text-red-500">♥</span>
                        <span>in Jharkhand</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
