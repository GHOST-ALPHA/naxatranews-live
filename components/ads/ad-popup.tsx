/**
 * Ad Popup Component
 * Popup/modal advertisement component (client-side)
 * Shows popup ads after page load with delay and cookie-based frequency control
 */

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdDisplay } from "@/lib/services/ads.service";

interface AdPopupProps {
  ad: AdDisplay | null;
  onClose: () => void;
}

function AdPopupContent({ ad, onClose }: AdPopupProps) {
  if (!ad) return null;

  const clickUrl = ad.newsSlug ? `/news/${ad.newsSlug}` : ad.linkUrl;

  const handleClick = () => {
    if (ad.id && !ad.id.startsWith("default-") && clickUrl) {
      // Track click in background (non-blocking)
      fetch(`/api/ads/click/${ad.id}`, { method: "POST" }).catch(() => {
        // Silently fail - don't break the page
      });
    }
  };

  const content = (
    <div className="relative w-full aspect-[4/3] min-h-[280px] sm:min-h-[300px] bg-muted rounded-lg border border-border overflow-hidden shadow-2xl flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-30 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-sm transition-colors"
        onClick={onClose}
        aria-label="Close advertisement"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Ad Label */}
      <div className="absolute top-0 left-0 z-10 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wider text-white">
        Advertisement
      </div>

      {/* Ad Image */}
      <Image
        src={ad.imageUrl || "/ad-card.jpg"}
        alt={ad.title}
        fill
        className="object-cover"
        sizes="400px"
        priority
      />

      {/* Description Overlay */}
      {ad.description && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          <h3 className="text-sm font-semibold text-white mb-1">{ad.title}</h3>
          <p className="text-xs text-white/90 line-clamp-2">{ad.description}</p>
        </div>
      )}
    </div>
  );

  if (clickUrl) {
    return (
      <Link
        href={clickUrl}
        onClick={handleClick}
        className="block"
        target={ad.linkUrl?.startsWith("http") ? "_blank" : undefined}
        rel={ad.linkUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  return content;
}

interface AdPopupWrapperProps {
  className?: string;
  showDefault?: boolean;
  delay?: number; // Delay in milliseconds before showing popup (default: 3000ms)
  frequency?: number; // Show popup once per X days (default: 1 day)
}

export function AdPopup({
  className,
  showDefault = true,
  delay = 3000,
  frequency = 1
}: AdPopupWrapperProps) {
  const [ad, setAd] = useState<AdDisplay | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if popup was shown recently (cookie-based)
    const cookieName = "ad-popup-shown";
    const checkCookie = () => {
      if (typeof document === "undefined") return false;
      const cookies = document.cookie.split(";");
      const popupCookie = cookies.find((c) => c.trim().startsWith(`${cookieName}=`));
      if (popupCookie) {
        const timestamp = parseInt(popupCookie.split("=")[1], 10);
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        return daysSince < frequency;
      }
      return false;
    };

    // Set cookie to track when popup was shown
    const setCookie = () => {
      if (typeof document === "undefined") return;
      const expires = new Date();
      expires.setTime(expires.getTime() + frequency * 24 * 60 * 60 * 1000);
      document.cookie = `${cookieName}=${Date.now()};expires=${expires.toUTCString()};path=/`;
    };

    // Don't show if already shown recently
    if (checkCookie()) {
      console.log("AdPopup: Ad hidden due to frequency limit (cookie found)");
      setIsLoading(false);
      return;
    }

    // Fetch popup ad
    const fetchPopupAd = async (): Promise<AdDisplay | null> => {
      try {
        console.log("AdPopup: Fetching ad...");
        const response = await fetch("/api/ads/popup", {
          cache: "no-store",
          keepalive: true
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.ad) {
            console.log("AdPopup: Ad found", data.ad.id);
            setAd(data.ad);
            return data.ad;
          }
        }

        // Fallback to default if no ad in response or response not ok
        if (showDefault) {
          console.log("AdPopup: No ad found, using default");
          const defaultAd = {
            id: "default-popup",
            title: "Advertisement",
            description: "Popup advertisement space available",
            imageUrl: "/ad-card.jpg",
            linkUrl: null,
            zone: "popup",
            position: 0,
            newsId: null,
          };
          setAd(defaultAd);
          return defaultAd;
        }
      } catch (error) {
        console.error("Error loading popup ad:", error);
        if (showDefault) {
          const defaultAd = {
            id: "default-popup",
            title: "Advertisement",
            description: "Popup advertisement space available",
            imageUrl: "/ad-card.jpg",
            linkUrl: null,
            zone: "popup",
            position: 0,
            newsId: null,
          };
          setAd(defaultAd);
          return defaultAd;
        }
      } finally {
        setIsLoading(false);
      }
      return null;
    };

    // Fetch and show popup after delay
    const timer = setTimeout(async () => {
      const fetchedAd = await fetchPopupAd();
      // Only show if we have an ad and it has a valid image
      if (fetchedAd && fetchedAd.imageUrl) {
        setIsVisible(true);
        setCookie();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, showDefault, frequency]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Track impression when popup becomes visible
  useEffect(() => {
    if (isVisible && ad && !ad.id.startsWith("default-")) {
      fetch(`/api/ads/impression/${ad.id}`, {
        method: "POST",
        keepalive: true
      }).catch(() => {
        // Silently fail
      });
    }
  }, [isVisible, ad]);

  if (isLoading || !isVisible || !ad) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
        "animate-in fade-in duration-300",
        className
      )}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
    >
      <div
        className="relative w-full max-w-[400px] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AdPopupContent ad={ad} onClose={handleClose} />
      </div>
    </div>
  );
}

