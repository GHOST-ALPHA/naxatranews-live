"use client"

import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion } from "motion/react"
import { Breadcrumbs } from "@/components/misc/breadcrumbs"
import {
  Mail,
  Edit,
  Megaphone,
  HelpCircle,
  CheckCircle2,
  FileText,
  Shield,
  Scale,
  Cookie,
  MapPin,
  Phone
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StaticPageSection {
  type: "hero" | "content" | "features" | "contact-info" | "cta"
  title?: string
  content?: string
  buttonText?: string
  buttonLink?: string
  items?: Array<{
    title: string
    description: string
    value?: string
    icon?: string
  }>
}

interface StaticPageLayoutProps {
  title: string
  description: string
  sections: StaticPageSection[]
  lastUpdated?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  edit: Edit,
  megaphone: Megaphone,
  "help-circle": HelpCircle,
}

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export function StaticPageLayout({
  title,
  description,
  sections,
  lastUpdated
}: StaticPageLayoutProps) {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/10">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* SEO Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs />
        </div>

        {/* Header */}
        <motion.header
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="mb-10 sm:mb-14"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight text-foreground font-hindi bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/80">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-hindi max-w-3xl">
              {description}
            </p>
          )}
          {lastUpdated && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/50 text-[10px] sm:text-xs font-medium text-muted-foreground mt-6 border border-border/50">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary animate-pulse" />
              Last Updated: {lastUpdated}
            </div>
          )}
        </motion.header>

        <Separator className="mb-10 sm:mb-14 opacity-50" />

        {/* Content Sections */}
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-12 sm:gap-16"
        >
          {sections.map((section, index) => (
            <motion.section key={index} variants={itemAnimation}>
              {section.type === "hero" && (
                <article className="relative group max-w-4xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-30 transition duration-1000" />
                  <Card className="relative border shadow-xl shadow-primary/5 bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6 sm:p-10">
                      {section.title && (
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground tracking-tight">
                          {section.title}
                        </h2>
                      )}
                      {section.content && (
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-hindi">
                          {section.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </article>
              )}

              {section.type === "content" && (
                <article className="space-y-4 max-w-3xl">
                  {section.title && (
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-primary rounded-full" />
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                  )}
                  {section.content && (
                    <div className="pl-4 border-l-2 border-primary/5">
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-hindi">
                        {section.content}
                      </p>
                    </div>
                  )}
                </article>
              )}

              {section.type === "features" && section.items && (
                <div className="space-y-6">
                  {section.title && (
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                      {section.title}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {section.items.map((item, itemIndex) => (
                      <Card key={itemIndex} className="group border bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300">
                        <CardContent className="p-6 sm:p-8">
                          <div className="flex items-start gap-3.5">
                            <div className="mt-1 flex-shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {section.type === "contact-info" && section.items && (
                <div className="space-y-6">
                  {section.title && (
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                      {section.title}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {section.items.map((item, itemIndex) => {
                      const IconComponent = item.icon ? iconMap[item.icon] : Mail
                      return (
                        <Card key={itemIndex} className="group border bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300">
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300">
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div className="space-y-1.5">
                                <h3 className="font-bold text-lg text-foreground">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                                    {item.description}
                                  </p>
                                )}
                                {item.value && (
                                  <div className="pt-1">
                                    <a
                                      href={item.value.includes('@') ? `mailto:${item.value}` : `tel:${item.value.replace(/\s/g, '')}`}
                                      className="block text-sm sm:text-base text-primary hover:text-primary/80 transition-colors font-medium break-all"
                                    >
                                      {item.value}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
              {section.type === "cta" && (
                <article className="max-w-4xl">
                  <Card className="border shadow-xl shadow-primary/5 bg-gradient-to-br from-primary/5 via-card/40 to-card/40 backdrop-blur-xl rounded-2xl overflow-hidden border-primary/10">
                    <CardContent className="p-8 sm:p-12 text-center space-y-6">
                      {section.title && (
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                          {section.title}
                        </h2>
                      )}
                      {section.content && (
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                          {section.content}
                        </p>
                      )}
                      {section.buttonText && section.buttonLink && (
                        <div className="pt-4">
                          <a
                            href={section.buttonLink}
                            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                          >
                            {section.buttonText}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </article>
              )}
            </motion.section>
          ))}
        </motion.div>

        {/* Brand Note & Footer Link */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t text-center space-y-6"
        >
          <div className="space-y-1.5">
            <p className="text-base font-bold text-foreground">Naxatra News Hindi</p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Committed to delivering reliable Hindi journalism to our audience worldwide.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/contact" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Contact Support
            </a>
            <a href="/" className="px-5 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              Return Home
            </a>
          </div>
        </motion.footer>
      </div>
    </main>
  )
}
