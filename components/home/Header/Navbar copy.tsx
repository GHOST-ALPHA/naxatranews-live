"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  Facebook,
  Twitter,
  Instagram,
  Search,
  Menu,
  Calendar,
  ChevronRight,
  Home,
  X,
} from "lucide-react"
import { useScroll } from "@/hooks/use-scroll"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PublicMenu } from "@/types/public"
import { SearchBar } from "@/components/news/search-bar"
import { ModeToggle } from "@/components/layout/ThemeToggle/theme-toggle"
import { useRouter } from "next/navigation"
import { SocialIcons } from "@/components/layout/social-icons"
import { WeatherWidget } from "@/components/widgets/weather-widget"

interface NavbarProps {
  menus?: PublicMenu[]; // Optional: can be passed from server-side
}

export function Navbar({ menus: initialMenus }: NavbarProps = {}) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { scrolled, visible } = useScroll(20)
  const [publicMenus, setPublicMenus] = React.useState<PublicMenu[]>(initialMenus || []);
  const [isLoadingMenus, setIsLoadingMenus] = React.useState(!initialMenus || initialMenus.length === 0);
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  const currentDate = new Date().toLocaleDateString("hi-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Optimized menu loading - use server-side menus if provided, otherwise fetch
  React.useEffect(() => {
    // If menus provided from server, use them and cache
    if (initialMenus && initialMenus.length > 0) {
      setPublicMenus(initialMenus);
      setIsLoadingMenus(false);
      // Cache in localStorage for future use
      try {
        localStorage.setItem("publicMenus", JSON.stringify(initialMenus));
        localStorage.setItem("publicMenusTimestamp", Date.now().toString());
      } catch (e) {
        // localStorage not available, ignore
      }
      return;
    }

    // Fallback: Load from client-side with localStorage cache
    async function loadMenus() {
      // Check localStorage cache first
      try {
        const cachedMenus = localStorage.getItem("publicMenus");
        const cacheTimestamp = localStorage.getItem("publicMenusTimestamp");
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        if (
          cachedMenus &&
          cacheTimestamp &&
          Date.now() - parseInt(cacheTimestamp) < cacheExpiry
        ) {
          try {
            setPublicMenus(JSON.parse(cachedMenus));
            setIsLoadingMenus(false);
            // Load fresh data in background
            fetchMenus();
            return;
          } catch (err) {
            console.error("Failed to parse cached menus", err);
          }
        }
      } catch (e) {
        // localStorage not available, continue to fetch
      }

      // Load from API
      await fetchMenus();
    }

    async function fetchMenus() {
      try {
        const res = await fetch("/api/public/menus", {
          cache: "force-cache",
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPublicMenus(json.data);
          // Cache in localStorage
          try {
            localStorage.setItem("publicMenus", JSON.stringify(json.data));
            localStorage.setItem("publicMenusTimestamp", Date.now().toString());
          } catch (e) {
            // localStorage not available, ignore
          }
        }
      } catch (err) {
        console.error("Failed loading public menus", err);
      } finally {
        setIsLoadingMenus(false);
      }
    }

    loadMenus();
  }, [initialMenus]);

  const handleMobileNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Spacer to prevent layout shift */}
      <div className="h-[120px] w-full invisible hidden md:block" />
      <div className="h-16 w-full invisible md:hidden" />

      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-transform duration-300 ease-in-out ",
          !visible ? "-translate-y-full md:-translate-y-16" : "translate-y-0",
          scrolled ? "shadow-md" : "",
        )}
      >
        {/* Top Bar / Mobile Main Bar */}
        <div className="md:h-16 h-12 border-b border-border bg-gradient-to-r from-[#12366d] via-[#0a2147] to-[#07162f] text-white shadow-lg">
          <div className="container mx-auto flex h-full items-center justify-between px-4 lg:px-6">
            {/* Mobile Toggle (Left) */}
            <div className="flex md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle menu" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85vw] max-w-[300px] p-0 flex flex-col bg-background border-r"

                >
                  {/* Compact Header */}
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 m-0 p-0">
                      {/* Compact Logo */}
                      <div className="flex h-9 w-auto items-center justify-center">
                        <img
                          src="/assets/logo.png"
                          alt="Bawal News"
                          className="h-full w-auto"
                        />
                      </div>

                      {/* Compact Text */}
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-base leading-none text-red-600">
                          Bawal News
                        </span>
                        <span className="text-[10px] mt-0.5 font-medium text-muted-foreground">
                          खबरें जो आपको जगा दे
                        </span>
                      </div>
                    </SheetTitle>



                  </div>

                  {/* Compact Navigation */}
                  <div className="flex-1 overflow-y-auto py-0">
                    <nav className="flex flex-col space-y-0.5 px-2">
                      {/* Home Link */}
                      <Button
                        variant="ghost"
                        onClick={() => handleMobileNavigation("/")}
                        className="w-full justify-start gap-2 px-2 py-2 h-9 text-xs font-normal"
                      >
                        <span className="text-xs">होम</span>
                      </Button>

                      {/* Compact Menu Items */}
                      {publicMenus.map((menu) => (
                        <div key={menu.id} className="border-b border-border/30 last:border-b-0">
                          {menu.children.length === 0 ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleMobileNavigation(`/${menu.slug}`)}
                              className="w-full justify-start px-2 py-2 h-9 text-xs font-normal"
                            >
                              {menu.name}
                            </Button>
                          ) : (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value={menu.id} className="border-b-0">
                                <AccordionTrigger className="py-2 text-xs hover:no-underline [&[data-state=open]]:bg-accent/50 rounded-md px-2">
                                  <span className="text-xs font-normal">{menu.name}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-1 pt-0">
                                  <div className="space-y-0.5 ml-1">
                                    {menu.children.map((child) => (
                                      <Button
                                        key={child.id}
                                        variant="ghost"
                                        onClick={() => handleMobileNavigation(`/${child.slug}`)}
                                        className="w-full justify-start pl-3 py-1.5 h-8 text-xs font-normal"
                                      >
                                        {child.name}
                                      </Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>

                  {/* Ultra Compact Footer */}
                  <div className="border-t border-border bg-muted/5 p-3 space-y-3 mt-auto">
                    {/* Social Icons - Full Width Row */}
                    <div className="flex items-center justify-between gap-1">
                      <SocialIcons />
                    </div>

                    {/* Sign In & Toggle - Compact Row */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSignIn}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-xs h-8"
                      >
                        SIGN IN
                      </Button>

                      <div className="flex-shrink-0">
                        <ModeToggle />
                      </div>
                    </div>

                    {/* Ultra Compact Credits */}
                    <div className="text-center pt-1">
                      <p className="text-[10px] text-muted-foreground">
                        © {new Date().getFullYear()} Bawal News
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Ultra Advanced Brand Logo */}
            <a
              href="/"
              className="
    
    flex items-center justify-center
    group relative
  "
            >

              {/* Logo Box (Always Visible & Centered on Mobile) */}
              <div className="flex h-9 sm:h-10 md:h-10 w-auto items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Bawal News"
                  className="h-full w-auto object-contain"
                />
              </div>

              {/* ✅ Brand Text → HIDDEN on Mobile, Visible on Desktop ONLY */}
              <div className="hidden md:flex flex-col ml-4 leading-none text-left">
                <span
                  className="
        text-[24px] md:text-[28px]
        font-black tracking-tight
        bg-gradient-to-r from-white via-zinc-200 to-zinc-400
        bg-clip-text text-transparent
        whitespace-nowrap
      "
                >
                  BAWAL
                  <span className="ml-1 text-red-500 drop-shadow-sm">NEWS</span>
                </span>

                <span
                  className="
        mt-1 text-[11px]
        uppercase tracking-[0.35em]
        text-zinc-400
      "
                >
                  Digital Media Network
                </span>
              </div>
            </a>




            {/* Desktop Socials & Subscribe */}
            <div className="hidden items-center gap-6 md:flex">
              {/* widgets */}
              <div className="hidden lg:block">
                <WeatherWidget />
              </div>

              {/* Date */}
              {/* <div className="flex items-center gap-2 text-sm text-white/90">
                <Calendar className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold">{currentDate}</span>

                </div>
              </div> */}
              <div className="flex items-center gap-2 border-l border-border pl-6">
                <SocialIcons size="sm" />
                <ModeToggle />
                <Button
                  onClick={() => router.push("/auth/sign-in")}
                  className="ml-2 bg-blue-600 font-semibold hover:bg-blue-700 text-white text-sm h-9 px-4"
                >
                  SIGN IN
                </Button>
              </div>
            </div>

            {/* Mobile Functional Search (Right) */}
            <div className="flex md:hidden justify-end">
              <div
                className={cn(
                  "absolute left-0 top-0 w-full h-full flex items-center px-4 transition-all duration-200 ease-in-out z-50",
                  isMobileSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none",
                )}
              >
                <div className="relative w-full max-w-md mx-auto">
                  <SearchBar variant="mobile" onClose={() => setIsMobileSearchOpen(false)} />
                </div>
              </div>
              <Button
                variant="link"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Open search"
                className="h-9 w-9 cursor-pointer hover:bg-transparent hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar (Desktop Only) */}
        <div className="border-b-4 border-red-600 bg-gradient-to-r from-[#07162f] via-[#0a2147] to-[#07162f] text-white shadow-lg hidden md:block">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex h-12 items-center justify-between">
              {/* Mini Logo - Only shows when Top Bar is hidden */}
              <div
                className={cn(
                  "flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out",
                  !visible ? "w-auto opacity-100 mr-4" : "w-0 opacity-0",
                )}
              >
                <img
                  src="/assets/logo.png"
                  alt="Bawal News"
                  className="h-7 w-auto"
                />
                <span className="hidden sr-only font-bold whitespace-nowrap lg:inline-block">
                  Bawal News
                </span>
              </div>

              {/* Desktop Navigation Links */}
              <div className="flex-1">
                <NavigationMenu className="mx-0 max-w-full justify-start">
                  <NavigationMenuList className="flex w-full items-center justify-start gap-0">
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        href="/"
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors text-white hover:text-red-500 hover:text-accent-foreground focus:text-primary focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                      >
                        होम
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    {isLoadingMenus ? (
                      <NavigationMenuItem>
                        <NavigationMenuLink className="text-muted-foreground text-sm">
                          Loading...
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ) : (
                      publicMenus.map((menu) => (
                        <NavigationMenuItem key={menu.id}>
                          {menu.children.length === 0 ? (
                            <NavigationMenuLink
                              href={`/${menu.slug}`}
                              className="relative group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2
                              text-sm font-semibold text-white
                              transition-all duration-200
                              underline-offset-8
                              hover:underline hover:decoration-red-500 hover:decoration-[2px]
                              focus:underline focus:decoration-red-500 focus:decoration-[2px]
                              focus:outline-none
                              hover:text-red-500
                              focus:outline-none
                              disabled:pointer-events-none disabled:opacity-50"
                            >
                              {menu.name}
                            </NavigationMenuLink>

                          ) : (
                            <>
                              <NavigationMenuTrigger className="h-9 px-3 text-sm">
                                {menu.name}
                              </NavigationMenuTrigger>
                              <NavigationMenuContent>
                                <ul className="grid w-[380px] gap-2 p-3">
                                  {menu.children.map((child) => (
                                    <li key={child.id}>
                                      <NavigationMenuLink asChild>
                                        <a
                                          href={`/${child.slug}`}
                                          className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
                                        >
                                          <div className="font-medium leading-none">
                                            {child.name}
                                          </div>
                                        </a>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              </NavigationMenuContent>
                            </>
                          )}
                        </NavigationMenuItem>
                      ))
                    )}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* Desktop Search */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
                    isSearchOpen ? "w-72 opacity-100" : "w-0 opacity-0",
                  )}
                >
                  {isSearchOpen && <SearchBar variant="desktop" />}
                </div>
                <Button
                  variant="link"
                  size="icon"
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="ml-1 h-8 w-8 cursor-pointer hover:bg-transparent hover:text-white"
                >
                  {isSearchOpen ? <ChevronRight className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}