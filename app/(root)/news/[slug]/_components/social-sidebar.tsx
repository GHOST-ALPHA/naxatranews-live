"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Linkedin, Mail, Share2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { shareOnFacebook, shareOnTwitter, shareOnLinkedIn, shareViaEmail, copyToClipboard } from "@/lib/utils/share"
import { toast } from "sonner"

export function SocialSidebar() {
  const [shareData, setShareData] = useState({
    url: "",
    title: "",
    description: "",
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Get article data from page
    const articleTitle = document.querySelector("h1")?.textContent || ""
    const articleExcerpt = document.querySelector("p")?.textContent || ""
    const currentUrl = window.location.href

    setShareData({
      url: currentUrl,
      title: articleTitle,
      description: articleExcerpt,
    })

    const handleScroll = () => {
      // Show after scrolling past the hero image (approx 400px)
      const scrolled = window.scrollY > 300
      setIsVisible(scrolled)
    }

    // Initial check
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-center w-12 pt-2 transition-opacity duration-500 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest writing-vertical-lr transform rotate-90">
        SHARE
      </span>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => shareOnFacebook(shareData)}
          className="h-10 w-10 rounded-full bg-background shadow-sm text-[#FF6B35] border-orange-100 hover:bg-orange-50 transition-transform hover:scale-110"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => shareOnTwitter(shareData)}
          className="h-10 w-10 rounded-full bg-background shadow-sm text-[#FF6B35] border-orange-100 hover:bg-orange-50 transition-transform hover:scale-110"

          aria-label="Share on Twitter"
        >
          <svg
            viewBox="0 0 1200 1227"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
          </svg>
        </Button>


        <Button
          variant="outline"
          size="icon"
          onClick={() => shareOnLinkedIn(shareData)}
          className="h-10 w-10 rounded-full bg-background shadow-sm text-[#FF6B35] border-orange-100 hover:bg-orange-50 transition-transform hover:scale-110"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => shareViaEmail(shareData)}
          className="h-10 w-10 rounded-full bg-background shadow-sm text-gray-600 border-gray-200 hover:bg-gray-50 transition-transform hover:scale-110"
          aria-label="Share via Email"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={async () => {
            const success = await copyToClipboard(shareData.url)
            if (success) {
              toast.success("Link copied to clipboard!")
            } else {
              toast.error("Failed to copy link")
            }
          }}
          className="h-10 w-10 rounded-full bg-background shadow-sm text-gray-600 border-gray-200 hover:bg-gray-50 transition-transform hover:scale-110"
          aria-label="Copy link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            nativeShare({
              title: "Bawal News",
              text: "Read this breaking news on Bawal News",
              url: window.location.href,
            })
          }
          className="h-10 w-10 rounded-full bg-background shadow-sm hover:bg-orange-50 transition-transform hover:scale-110"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </Button>

      </div>
    </div>
  )
}


export async function nativeShare(data: {
  title: string
  text: string
  url: string
}) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      })
    } catch (err) {
      console.log("Share cancelled", err)
    }
  } else {
    // ✅ Fallback (desktop Firefox, old browsers)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
      "_blank"
    )
  }
}
