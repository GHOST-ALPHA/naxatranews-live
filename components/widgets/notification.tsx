"use client"

import * as React from "react"
import { Bell, Clock, ExternalLink, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import type { NewsResponse } from "@/lib/services/news-api.service"

interface NotificationProps {
  className?: string
}

export function Notification({ className }: NotificationProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<NewsResponse[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  // Fetch notifications when sheet opens or refresh periodically
  React.useEffect(() => {
    if (isOpen) {
      // Fetch immediately if no notifications or if it's been more than 5 minutes
      const lastFetch = sessionStorage.getItem("notificationsLastFetch")
      const shouldFetch = 
        notifications.length === 0 || 
        !lastFetch || 
        Date.now() - parseInt(lastFetch) > 5 * 60 * 1000 // 5 minutes
      
      if (shouldFetch) {
        fetchNotifications()
      }
    }
  }, [isOpen, notifications.length])

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/news/recent?limit=10", {
        cache: "no-store",
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        setNotifications(data.data)
        sessionStorage.setItem("notificationsLastFetch", Date.now().toString())
      } else {
        setError("Failed to load notifications")
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return "Just now"
    
    const now = new Date()
    const published = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return published.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handleNotificationClick = (slug: string) => {
    router.push(`/news/${slug}`)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 cursor-pointer hover:bg-transparent hover:text-white transition-all duration-200",
            className
          )}
          aria-label="View notifications"
        >
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] md:w-[450px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#051529] via-[#102039] to-[#051529]">
          <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Latest News
          </SheetTitle>
          <p className="text-sm text-white/70 mt-1">
            Stay updated with the latest stories
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-4">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                No recent notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors cursor-pointer group",
                    notification.isBreaking && "bg-red-500/10 border-l-4 border-l-red-500"
                  )}
                  onClick={() => handleNotificationClick(notification.slug)}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {notification.coverImage && (
                      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={notification.coverImage}
                          alt={notification.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="80px"
                        />
                        {notification.isBreaking && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                            BREAKING
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {notification.title}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>

                      {notification.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {notification.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(notification.publishedAt)}</span>
                        </div>
                        {notification.viewCount > 0 && (
                          <span>• {notification.viewCount.toLocaleString()} views</span>
                        )}
                        {notification.categories && notification.categories.length > 0 && (
                          <span className="text-primary font-medium">
                            • {notification.categories[0].menu.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t px-6 py-3 bg-muted/30">
            <NextLink
              href="/news"
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              View all news
              <ExternalLink className="h-3 w-3" />
            </NextLink>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
