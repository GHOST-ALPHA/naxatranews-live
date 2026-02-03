"use client"

import * as React from "react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
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
  ChevronDown,
  Home,
  X,
  Link,
} from "lucide-react"
import { useScroll } from "@/hooks/use-scroll"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PublicMenu } from "@/types/public"
import { SearchBar } from "@/components/news/search-bar"
import { ModeToggle } from "@/components/layout/ThemeToggle/theme-toggle"
import { useRouter } from "next/navigation"
import { SocialIcons } from "@/components/layout/social-icons"
import Image from "next/image"
import { getCurrentDateFormatted, getLiveTime } from "@/lib/utils/datetime-utils"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { WeatherWidget } from "@/components/widgets/weather-widget"
import { IconDeviceTv } from "@tabler/icons-react"
import { Notification } from "@/components/widgets/notification"

interface NavbarProps {
  menus?: PublicMenu[]; // Optional: can be passed from server-side
}


function NavbarComponent({ menus: initialMenus }: NavbarProps = {}) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { scrolled, visible } = useScroll(20)
  const [publicMenus, setPublicMenus] = React.useState<PublicMenu[]>(initialMenus || []);
  const [isLoadingMenus, setIsLoadingMenus] = React.useState(!initialMenus || initialMenus.length === 0);
  const router = useRouter();
  // Fix hydration: Initialize with empty string, set time only on client
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [isMounted, setIsMounted] = React.useState(false);
  const currentDate = getCurrentDateFormatted("hi-IN");

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

  // Fix hydration: Only set time after component mounts (client-side only)
  // Production-optimized: Use requestAnimationFrame for smoother updates
  React.useEffect(() => {
    setIsMounted(true);
    // Set initial time immediately
    setCurrentTime(getLiveTime());

    // Update time every second for live clock display
    // Production: Use setInterval with proper cleanup
    let intervalId: ReturnType<typeof setTimeout>;
    let rafId: any;

    const updateTime = () => {
      setCurrentTime(getLiveTime());
      intervalId = setTimeout(updateTime, 1000);
    };

    // Start the interval
    intervalId = setTimeout(updateTime, 1000);

    return () => {
      clearTimeout(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
      <div className="h-28 w-full invisible md:hidden" />

      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-transform duration-300 ease-in-out ",
          !visible ? "-translate-y-full md:-translate-y-16" : "translate-y-0",
          scrolled ? "shadow-md" : "",
        )}
      >

        {/* Top Bar / Mobile Main Bar */}
        <div className="md:h-16 h-12  bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529] text-white shadow-lg">
          <div className="flex h-full items-center justify-between px-0 lg:px-6">
            {/* Mobile Toggle (Left) */}
            <div className="flex ">
              {/* Ultra Advanced Brand Logo */}
              <a
                href="/"
                className="flex items-center justify-center group relative absolute top-6 right-6 z-50 hidden md:block"
                style={{
                  visibility: visible ? "visible" : "hidden",
                  opacity: visible ? 1 : 0,
                  transition: "visibility 0s, opacity 0.3s ease-in-out",
                }}
              >
                {/* Logo Icon (Always Visible & Centered on Mobile) */}
                <div className="flex h-9 sm:h-6 md:h-10 w-auto items-center justify-center">
                  <Image src="/logo/logo.png" alt="Naxatra_News" width={140} height={140} />
                </div>
              </a>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="noting" size="icon" aria-label="Toggle menu" className="h-9 w-9 cursor-pointer">
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85vw] max-w-[300px] p-0 flex flex-col bg-background border-r"

                >
                  {/* Compact Header */}
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 m-0 p-0">

                      <Image src="/logo/logo.png" alt="Naxatra_News" width={40} height={40} />
                      {/* Compact Text */}
                      <div className="flex flex-col items-start">
                        <span className="font-black text-xl leading-none  tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                          Naxatra News
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
                        className="w-full justify-start gap-2 px-2 py-2 h-9 text-sm font-bold"
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
                              className="w-full justify-start px-2 py-2 h-9 text-sm font-bold "
                            >
                              {menu.name.toUpperCase()}
                            </Button>
                          ) : (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value={menu.id} className="border-b-0">
                                <AccordionTrigger className="py-2 text-xs hover:no-underline [&[data-state=open]]:bg-accent/50 rounded-md px-2">
                                  <span className="text-sm font-bold">{menu.name.toUpperCase()}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-1 pt-0">
                                  <div className="space-y-0.5 ml-1">
                                    {menu.children.map((child) => (
                                      <Button
                                        key={child.id}
                                        variant="ghost"
                                        onClick={() => handleMobileNavigation(`/${child.slug}`)}
                                        className="w-full justify-start pl-3 py-1.5 h-8 text-sm font-bold"
                                      >
                                        {child.name.toUpperCase()}
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
                      <div className="flex-shrink-0">
                        <ModeToggle />
                      </div>
                    </div>

                    {/* Sign In & Toggle - Compact Row */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSignIn}
                        className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-2 text-xs h-8"
                      >
                        SIGN IN
                      </Button>


                    </div>

                    {/* Ultra Compact Credits */}
                    <div className="text-center pt-1">
                      <p className="text-[10px] text-muted-foreground">
                        © {new Date().getFullYear()} Naxatra News
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <div
                className=
                "flex items-center justify-center group relative md:hidden pl-2"
              >
                <Image src="/logo/logo.png" alt="Naxatra_News" width={50} height={50} />

              </div>


            </div>    {/* main logo for desktop */}
            <div className="hidden lg:flex items-center select-none group cursor-pointer transition-all duration-500 hover:scale-[1.01]" onClick={() => router.push("/")}>
              <div className="flex items-baseline py-1">
                <span className="text-5xl xl:text-7xl font-black tracking-tighter text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)] uppercase">
                  NAXATRA NEWS
                </span>

              </div>
            </div>



            {/* Desktop Socials & Subscribe */}
            <div className="hidden items-center gap-6 md:flex">
              {/* <div className="flex items-center gap-2 text-sm text-white/90">
                <Calendar className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{currentDate}</span>
                  {isMounted ? (
                    <span className="text-xs text-white/70">{currentTime} IST</span>
                  ) : (
                    <span className="text-xs text-white/70">--:--:-- IST</span>
                  )}
                </div>
              </div> */}
              {/* <div className="hidden lg:block">
                <WeatherWidget />
              </div> */}
              <div className="flex items-center gap-2  pl-6">
                <SocialIcons size="sm" />
                <ModeToggle />
                {/* <Button
                  onClick={() => router.push("/auth/sign-in")}
                  className="ml-2 bg-[#FF6B35] font-semibold hover:bg-[#E55A2B] text-white text-sm h-9 px-4"
                >
                  SIGN IN
                </Button> */}
              </div>
            </div>

            {/* Mobile Functional Search (Right) */}
            <div className="flex md:hidden justify-end gap-2 px-2">
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
              <Button variant="ghost" size="icon" className="cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out hover:text-white">
                <IconDeviceTv className="h-6 w-6 text-red-500" />
              </Button>

              {/* notification */}
              <Notification />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Open search"
                className="cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out hover:text-white"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar - Desktop & Mobile */}
        <div className="flex justify-between items-center  bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529] text-white shadow-lg">
          <div className="w-full md:max-w-7xl mx-auto px-2 lg:pl-8">
            {/* Desktop Layout */}
            <div className="hidden md:flex h-12 items-center justify-between">
              {/* Mini Logo - Only shows when Top Bar is hidden */}
              <a href="/">

                <div
                  className={cn(
                    "flex items-center justify-center group relative absolute top-14 left-8 z-50",
                    !visible ? "w-auto opacity-100 mr-4" : "w-0 opacity-0",
                  )}
                >
                  <Image src="/logo/logo.png" alt="Naxatra_News" width={80} height={80} />

                </div>
              </a>
              {/* Desktop Navigation Links */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <Menubar className="h-12 border-0 bg-transparent p-0 min-w-max">
                  {/* Home Link */}
                  <MenubarMenu>
                    <MenubarTrigger
                      asChild
                      className="h-9 text-sm font-semibold text-white hover:text-red-500 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-500"
                    >
                      <a
                        href="/"
                        className="underline-offset-8 hover:underline hover:decoration-red-500 hover:decoration-[2px] focus:underline focus:decoration-red-500 focus:decoration-[2px]"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push("/");
                        }}
                      >
                        होम
                      </a>
                    </MenubarTrigger>
                  </MenubarMenu>

                  {/* Menu Items */}
                  {isLoadingMenus ? (
                    <span className=" py-2 text-sm text-white/70">
                      Loading...
                    </span>
                  ) : (
                    publicMenus.map((menu) => {
                      if (menu.children.length === 0) {
                        return (
                          <MenubarMenu key={menu.id}>
                            <MenubarTrigger
                              asChild
                              className="h-9 text-sm font-semibold text-white hover:text-red-500 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-500"
                            >
                              <a
                                href={`/${menu.slug}`}
                                className="underline-offset-8 hover:underline hover:decoration-red-500 hover:decoration-[2px] focus:underline focus:decoration-red-500 focus:decoration-[2px]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/${menu.slug}`);
                                }}
                              >
                                {menu.name.toUpperCase()}
                              </a>
                            </MenubarTrigger>
                          </MenubarMenu>
                        );
                      }

                      return (
                        <MenubarMenu key={menu.id}>
                          <MenubarTrigger className="h-9 px-3 text-sm font-semibold text-white hover:text-red-500 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-500 group flex items-center gap-1.5">
                            {menu.name.toUpperCase()}
                            <ChevronDown className="h-3.5 w-3.5 text-white  transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0 stroke-white" />
                          </MenubarTrigger>
                          <MenubarContent
                            className="border-white/10 bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529] p-1 shadow-lg"
                            align="start"
                            sideOffset={0}
                          >
                            {menu.children.map((child) => (
                              <MenubarItem
                                key={child.id}
                                className="text-white hover:bg-white/10 hover:text-red-500 focus:bg-white/10 focus:text-red-500 cursor-pointer rounded-md px-3 py-2"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  router.push(`/${child.slug}`);
                                }}
                              >
                                {child.name.toUpperCase()}
                              </MenubarItem>
                            ))}
                          </MenubarContent>
                        </MenubarMenu>
                      );
                    })
                  )}
                </Menubar>
              </div>


            </div>

            {/* Mobile Layout - Horizontal Scrollable */}
            <div className="md:hidden h-12">
              <div
                className="overflow-x-auto scrollbar-hide scroll-smooth h-full"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="flex items-center gap-0 px-2 min-w-max h-full">
                  {/* Home Link */}
                  <a
                    href="/"
                    className="relative flex-shrink-0 px-3 py-2 text-sm font-semibold text-white transition-colors whitespace-nowrap hover:text-red-500"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/")
                    }}
                  >
                    होम
                  </a>

                  {/* Menu Items */}
                  {isLoadingMenus ? (
                    <div className="flex-shrink-0 px-3 py-2 text-sm text-white/70">
                      Loading...
                    </div>
                  ) : (
                    publicMenus.map((menu) => {
                      // For mobile, only show parent menu items (no dropdowns)
                      if (menu.children.length > 0) {
                        return (
                          <a
                            key={menu.id}
                            href={`/${menu.slug}`}
                            className="relative capitalize flex-shrink-0 px-3 py-2 text-sm font-semibold text-white transition-colors whitespace-nowrap hover:text-red-500"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push(`/${menu.slug}`)
                            }}
                          >
                            {menu.name.toUpperCase()}
                          </a>
                        )
                      }

                      return (
                        <a
                          key={menu.id}
                          href={`/${menu.slug}`}
                          className="relative capitalize flex-shrink-0 px-3 py-2 text-sm font-semibold text-white transition-colors whitespace-nowrap hover:text-red-500"
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/${menu.slug}`)
                          }}
                        >
                          {menu.name.toUpperCase()}
                        </a>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="flex items-center hidden md:flex  absolute right-0 md:right-2 z-50">
            <div
              className={cn(
                "flex items-center bg-card rounded-md  overflow-hidden transition-all duration-300 ease-in-out",
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
              className="ml-1 h-8 w-8 cursor-pointer bg-card rounded-md  overflow-hidden transition-all duration-300 ease-in-out absolute right-0 z-50"
            >
              {isSearchOpen ? <X className="h-4 w-4 " /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

// Memoize Navbar to prevent unnecessary re-renders (production optimization)
export const Navbar = memo(NavbarComponent)