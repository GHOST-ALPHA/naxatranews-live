"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { socialLinks } from "@/lib/config/social-links"

interface BrandSocialIconsProps {
  size?: "sm" | "md"
  className?: string
}

export function SocialIcons({ size = "md", className = "" }: BrandSocialIconsProps) {
  const imageSize = size === "md" ? 20 : 24
  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socialLinks.map((item) => {
        return (
          <Button
            key={item.name}
            size="icon"
            variant="outline"
            className={`${btnSize} transition-all duration-200 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900`}
            asChild
          >
            <Link href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${item.name}`}>
              <Image
                src={item.logo || "/placeholder.svg"}
                alt={item.name}
                width={imageSize}
                height={imageSize}
                className="object-contain"
              />
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
