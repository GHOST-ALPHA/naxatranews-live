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
    <div className="relative w-full max-w-[400px] aspect-[4/3] bg-muted rounded-lg border border-border overflow-hidden shadow-2xl">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
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
        src={ad.imageUrl || "https://via.placeholder.com/400x300/1e293b/94a3b8?text=Advertisement"}
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
      setIsLoading(false);
      return;
    }

    // Fetch popup ad
    const fetchPopupAd = async () => {
      try {
        const response = await fetch("/api/ads/popup", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data.ad) {
            setAd(data.ad);
            return true;
          } else if (showDefault) {
            // Use default popup ad
            setAd({
              id: "default-popup",
              title: "Advertisement",
              description: "Popup advertisement space available",
              imageUrl: "https://www.bawalnews.com/storage/media/uploads/placeholder-1764866027363-00de23ee72a4108a.jpg",
              linkUrl: null,
              zone: "popup",
              position: 0,
              newsId: null,
            });
            return true;
          }
        }
      } catch (error) {
        console.error("Error loading popup ad:", error);
        if (showDefault) {
          setAd({
            id: "default-popup",
            title: "Advertisement",
            description: "Popup advertisement space available",
            imageUrl: "https://www.bawalnews.com/storage/media/uploads/placeholder-1764866027363-00de23ee72a4108a.jpg",
            linkUrl: null,
            zone: "popup",
            position: 0,
            newsId: null,
          });
          return true;
        }
      } finally {
        setIsLoading(false);
      }
      return false;
    };

    // Fetch and show popup after delay
    const timer = setTimeout(async () => {
      const hasAd = await fetchPopupAd();
      // Check if we have an ad to show
      if (hasAd) {
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
      fetch(`/api/ads/impression/${ad.id}`, { method: "POST" }).catch(() => {
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
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        <AdPopupContent ad={ad} onClose={handleClose} />
      </div>
    </div>
  );
}

