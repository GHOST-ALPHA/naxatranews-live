import { cache } from "react"

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  video?: string // YouTube, Vimeo, or direct video URL
  author: string
  authorId?: string
  authorUsername?: string
  authorAvatar?: string
  source: string
  date: string
  slug: string
  category: string
  readTime?: string
  comments?: number
  updatedDate?: string
  tags?: string[]
  fullContent?: string
}

export interface Ad {
  id: string
  type: "banner" | "sidebar"
  image: string
  link: string
  title?: string
  description?: string
  category?: string
  readTime?: string
  commentsCount?: number
  updatedDate?: string
}


