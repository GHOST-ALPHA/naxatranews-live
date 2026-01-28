import Image from "next/image"
import { SocialIcons } from "@/components/layout/social-icons"

interface AuthorBioProps {
  author: string
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-12 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="relative h-24 w-24 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-primary shadow-lg">
        <Image src="/assets/logo.png" alt={author} fill className="object-cover" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-between mb-2 flex-wrap gap-2">
          <h3 className="font-bold text-lg text-foreground">{author}</h3>
          <div className="flex items-center gap-2">
             <SocialIcons size="sm" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-0">
          specializes in local and regional stories, bringing simple, factual, and timely updates to readers.
        </p>
      </div>
    </div>
  )
}
