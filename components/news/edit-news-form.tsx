"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateNews } from "@/lib/actions/news";
import { getPublicMenus } from "@/lib/actions/menus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Image as ImageIcon,
  Tag,
  Globe,
  Share2,
  AlertCircle,
  CheckCircle2,
  Save,
  X,
  ArrowLeft,
  LayoutTemplate,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { Editor } from "@/components/blocks/editor-x/editor";
import { SerializedEditorState } from "lexical";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MediaPicker } from "@/components/media/media-picker";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { VideoPreview } from "@/components/news/video-preview";
import { validateVideoUrl } from "@/lib/utils/video";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { generateSlug } from "@/lib/utils/slug";
import { GooglePreview } from "@/components/news/google-preview";
import { cn } from "@/lib/utils";

// Custom URL validation
const urlOrEmpty = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? "" : val),
  z.union([
    z.literal(""),
    z.string().regex(/^\/.*/, "Relative URL must start with /"),
    z.string().url("Please enter a valid URL"),
  ])
).optional();

const updateNewsSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug must be less than 200 characters").optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
  coverImage: urlOrEmpty,
  coverVideo: urlOrEmpty.refine((val) => {
    if (!val) return true;
    return validateVideoUrl(val).isValid;
  }, "Must be a valid YouTube, Vimeo, or direct video URL"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
  metaKeywords: z.string().optional(),
  ogImage: urlOrEmpty,
  scheduledAt: z.string().datetime().optional(),
});

type UpdateNewsFormData = z.infer<typeof updateNewsSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EditNewsFormProps {
  news: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    coverVideo: string | null;
    isPublished: boolean;
    isActive: boolean;
    isBreaking: boolean;
    isFeatured: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
    scheduledAt: Date | null;
    categories: Array<{
      menu: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
  canPublish?: boolean;
  canSubmit?: boolean;
}

export function EditNewsForm({ news, canPublish = false, canSubmit = false }: EditNewsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    news.categories.map((c) => c.menu.id)
  );

  const [editorContent, setEditorContent] = useState<SerializedEditorState | null>(() => {
    try {
      return JSON.parse(news.content);
    } catch {
      return null;
    }
  });

  const [isScheduled, setIsScheduled] = useState(!!news.scheduledAt);
  const [charCount, setCharCount] = useState({ title: 0, excerpt: 0, metaTitle: 0, metaDescription: 0 });

  // Load categories
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const result = await getPublicMenus();
        if (mounted && result.success) {
          setCategories(result.menus || []);
        } else if (mounted) {
          console.error("Failed to load categories:", result.error);
        }
      } catch (error) {
        if (mounted) console.error("Failed to load categories", error);
      }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<UpdateNewsFormData>({
    resolver: zodResolver(updateNewsSchema),
    defaultValues: {
      id: news.id,
      title: news.title,
      slug: news.slug,
      content: news.content,
      excerpt: news.excerpt || "",
      coverImage: news.coverImage || "",
      coverVideo: news.coverVideo || "",
      isPublished: news.isPublished,
      isActive: news.isActive,
      isBreaking: news.isBreaking,
      isFeatured: news.isFeatured,
      metaTitle: news.metaTitle || "",
      metaDescription: news.metaDescription || "",
      metaKeywords: news.metaKeywords || "",
      ogImage: news.ogImage || "",
      categoryIds: news.categories.map((c) => c.menu.id),
      scheduledAt: news.scheduledAt ? new Date(news.scheduledAt).toISOString().slice(0, 16) : undefined,
    },
    mode: "onChange",
  });

  const title = watch("title");
  const slug = watch("slug");
  const excerpt = watch("excerpt");
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const metaKeywords = watch("metaKeywords");
  const coverImage = watch("coverImage");
  const coverVideo = watch("coverVideo");
  const ogImage = watch("ogImage");

  // Calculate SEO Score
  const seoAnalysis = useMemo(() => {
    let score = 0;
    const suggestions: string[] = [];
    const keywords = metaKeywords ? metaKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];

    if (title) {
      if (title.length >= 10 && title.length <= 70) score += 20;
      else suggestions.push("Title length should be between 10-70 chars.");
    }

    if (slug) score += 10;

    if (metaDescription) {
      if (metaDescription.length >= 50 && metaDescription.length <= 160) score += 20;
      else suggestions.push("Meta description should be between 50-160 chars.");
    } else {
      suggestions.push("Add a meta description for better SEO.");
    }

    if (keywords.length > 0) {
      score += 10;
      // Combine all headline-related fields for checking - robust bilingual check
      const headlineContext = `${title || ""} ${metaTitle || ""} ${(slug || "").replace(/-/g, ' ')}`.toLowerCase();

      // Combine description and content for checking context
      const contentText = editorContent ? JSON.stringify(editorContent).toLowerCase() : "";
      const descriptionContext = `${metaDescription || ""} ${excerpt || ""} ${contentText}`.toLowerCase();

      // Scoring: Give points if present in EITHER Headline OR Content context
      if (keywords.some(k => headlineContext.includes(k.toLowerCase()))) score += 10;
      if (keywords.some(k => descriptionContext.includes(k.toLowerCase()))) score += 10;

    } else {
      suggestions.push("Add meta keywords to target search terms.");
    }

    if (coverImage || coverVideo) score += 20;
    else suggestions.push("Add a cover image or video.");

    return { score: Math.min(score, 100), suggestions };
  }, [title, slug, metaDescription, metaKeywords, coverImage, coverVideo, metaTitle, excerpt, editorContent]);

  // Update character counts
  useEffect(() => {
    setCharCount({
      title: title?.length || 0,
      excerpt: excerpt?.length || 0,
      metaTitle: metaTitle?.length || 0,
      metaDescription: metaDescription?.length || 0,
    });
  }, [title, excerpt, metaTitle, metaDescription]);

  // Auto-generate slug
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle, { shouldValidate: true });

    if (autoSlug) {
      const generatedSlug = generateSlug(newTitle, { maxLength: 200 });
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [autoSlug, setValue]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      const newCategories = [...selectedCategories, categoryId];
      setSelectedCategories(newCategories);
      setValue("categoryIds", newCategories, { shouldValidate: true });
    }
  }, [selectedCategories, setValue]);

  const handleCategoryRemove = useCallback((categoryId: string) => {
    const newCategories = selectedCategories.filter((id) => id !== categoryId);
    setSelectedCategories(newCategories);
    setValue("categoryIds", newCategories, { shouldValidate: true });
  }, [selectedCategories, setValue]);

  const handleEditorChange = useCallback((serializedState: SerializedEditorState) => {
    setEditorContent(serializedState);
    const text = JSON.stringify(serializedState);
    setValue("content", text, { shouldValidate: true });
  }, [setValue]);

  const handleImageSelect = useCallback((field: "coverImage" | "ogImage", url: string) => {
    const normalizedUrl = url && !url.startsWith("http") && !url.startsWith("/") ? `/${url}` : url;
    setValue(field, normalizedUrl || "", { shouldValidate: true, shouldDirty: true });
    trigger(field);
  }, [setValue, trigger]);

  const handleImageRemove = useCallback((field: "coverImage" | "ogImage") => {
    setValue(field, "", { shouldValidate: true });
  }, [setValue]);

  const handleVideoChange = useCallback((url: string) => {
    setValue("coverVideo", url || "", { shouldValidate: true, shouldDirty: true });
    // We don't block the input anymore, but we can trigger validation
    // The error message will be shown below the input
  }, [setValue]);

  const handleVideoRemove = useCallback(() => {
    setValue("coverVideo", "", { shouldValidate: true });
  }, [setValue]);

  const handleScheduleToggle = useCallback((checked: boolean) => {
    setIsScheduled(checked);
    if (checked) {
      // If enabling schedule and no date set, don't set a default date yet to avoid validation errors if untouched
      // User must pick a date
    } else {
      setValue("scheduledAt", undefined, { shouldValidate: true });
    }
  }, [setValue]);

  const onSubmit = async (data: UpdateNewsFormData) => {
    if (!editorContent) {
      toast({
        title: "Error",
        description: "Please add content to your news post",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updateNews({
        ...data,
        content: JSON.stringify(editorContent),
        categoryIds: selectedCategories,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: data.isPublished ? "News post published!" : "News post updated.",
        });
        router.refresh();
        router.push("/dashboard/news");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update news post",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CharacterCounter = ({ current, max }: { current: number; max: number }) => (
    <span className={cn("text-xs transition-colors font-medium",
      current > max ? "text-destructive" : "text-muted-foreground/60"
    )}>
      {current}/{max}
    </span>
  );

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen pb-20">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Top Bar - Sticky Header */}
          <div className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold leading-none tracking-tight">Edit News Post</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {isDirty ? <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                      {isDirty ? "Unsaved changes" : "All changes saved"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center text-sm text-muted-foreground mr-2 bg-muted/40 px-3 py-1.5 rounded-md border">
                  <span className="font-medium text-foreground mr-2">Status:</span>
                  {watch("isPublished") ? "Live" : "Draft"}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className={cn("min-w-[130px] font-semibold shadow-sm transition-all",
                    watch("isPublished")
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :
                    watch("isPublished") ? <Share2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {watch("isPublished") ? "Update & Publish" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto pt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* PRIMARY COLUMN - CONTENT (9 cols) */}
            <div className="lg:col-span-9 space-y-8">

              {/* Title & Slug */}
              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    id="title"
                    placeholder="Enter your headline here..."
                    {...register("title")}
                    onChange={handleTitleChange}
                    disabled={loading}
                    className="text-lg md:text-xl font-bold tracking-tight h-auto p-2 border border group-hover:border-input focus-visible:ring-0 focus-visible:border-primary  rounded-sm bg-transparent placeholder:text-muted-foreground/40 shadow-none transition-all"
                  />
                  <div className="absolute right-0 top-3 text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                    <CharacterCounter current={charCount.title} max={200} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-dashed hover:border-solid hover:border-primary/30 transition-colors flex-1 min-w-[300px]">
                    <span className="font-semibold text-xs uppercase tracking-wide opacity-70">Permalink:</span>
                    <span className="text-muted-foreground/50">/news/</span>
                    <Input
                      id="slug"
                      {...register("slug")}
                      disabled={loading || autoSlug}
                      className="h-6 font-mono text-xs border-0 bg-transparent px-0 focus-visible:ring-0 w-full text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="autoSlug"
                      checked={autoSlug}
                      onCheckedChange={setAutoSlug}
                      className="scale-75 origin-right"
                    />
                    <Label htmlFor="autoSlug" className="text-xs cursor-pointer font-medium whitespace-nowrap">Auto-generate</Label>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="group">
                <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Excerpt / Subheadline</Label>
                <Textarea
                  placeholder="A short, catchy summary of the article..."
                  {...register("excerpt")}
                  className="resize-none text-lg leading-relaxed border-muted/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-muted/10 min-h-[100px]"
                />
                <div className="flex justify-end mt-1">
                  <CharacterCounter current={charCount.excerpt} max={300} />
                </div>
              </div>

              {/* Editor */}
              <div className="border rounded-lg shadow-sm bg-card overflow-hidden ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                {/* Editor Toolbar is handled inside the component */}
                <div className="min-h-[600px] p-1">
                  <Editor
                    editorSerializedState={editorContent || undefined}
                    onSerializedChange={handleEditorChange}
                  />
                </div>
              </div>
              {errors.content && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" /> {errors.content.message}
                </p>
              )}

              {/* Media Gallery */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" /> Media Assets
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-dashed hover:border-solid transition-colors bg-muted/5 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cover Image</CardTitle>
                      <CardDescription className="text-xs">Displayed on home page & detail header (16:9)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <MediaPicker
                          value={coverImage || ""}
                          onSelect={(url) => handleImageSelect("coverImage", url)}
                          type="image"
                          label="Select Cover Image"
                        />
                        {coverImage && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm">
                            <OptimizedImage src={coverImage} alt="Cover" fill className="object-cover" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleImageRemove("coverImage")}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed hover:border-solid transition-colors bg-muted/5 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Video Embed</CardTitle>
                      <CardDescription className="text-xs">YouTube, Vimeo or direct video link</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={coverVideo || ""}
                          onChange={(e) => handleVideoChange(e.target.value)}
                          className={cn("font-mono text-sm", errors.coverVideo && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.coverVideo && (
                          <p className="text-xs text-destructive font-medium mt-1">{errors.coverVideo.message as string}</p>
                        )}
                        {coverVideo && !errors.coverVideo && (
                          <div className="rounded-md overflow-hidden border">
                            <VideoPreview videoUrl={coverVideo} onRemove={handleVideoRemove} showRemove={true} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>

            {/* SECONDARY COLUMN - SETTINGS (3 cols) */}
            <div className="lg:col-span-3 space-y-6">

              {/* Publication Status Card */}
              <Card className="shadow-sm border-t-4 border-t-primary">
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4" /> Publication Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">

                  {/* Publish Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Publish to Site</Label>
                      <p className="text-xs text-muted-foreground">Make article visible</p>
                    </div>
                    <Switch
                      checked={watch("isPublished")}
                      onCheckedChange={(c) => setValue("isPublished", c, { shouldValidate: true })}
                      disabled={!canPublish}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Active</Label>
                      <p className="text-xs text-muted-foreground">Enable/Disable post</p>
                    </div>
                    <Switch
                      checked={watch("isActive")}
                      onCheckedChange={(c) => setValue("isActive", c, { shouldValidate: true })}
                    />
                  </div>

                  <Separator />

                  {/* Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-normal">Breaking News Ticker</Label>
                      <Switch checked={watch("isBreaking")} onCheckedChange={(c) => setValue("isBreaking", c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-normal">Featured Carousel</Label>
                      <Switch checked={watch("isFeatured")} onCheckedChange={(c) => setValue("isFeatured", c)} />
                    </div>
                  </div>

                  <Separator />

                  {/* Scheduling */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Schedule</Label>
                      <Switch checked={isScheduled} onCheckedChange={handleScheduleToggle} disabled={watch("isPublished")} />
                    </div>
                    {isScheduled && (
                      <div className="pt-1">
                        <Input type="datetime-local" {...register("scheduledAt")} className="text-sm font-mono" />
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>

              {/* Taxonomy / Categories */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Categorization
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Primary Categories</Label>
                    <Select onValueChange={handleCategorySelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-md border border-dashed min-h-[80px] content-start">
                    {selectedCategories.length === 0 && (
                      <p className="text-xs text-muted-foreground w-full text-center py-4">No categories selected.</p>
                    )}
                    {selectedCategories.map(catId => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <Badge key={catId} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-muted-foreground/30">
                          {cat.name}
                          <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => handleCategoryRemove(catId)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  {errors.categoryIds && <p className="text-xs text-destructive font-medium">{errors.categoryIds.message}</p>}
                </CardContent>
              </Card>

              {/* SEO Control Panel */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" /> SEO Settings
                    </CardTitle>
                    <Badge variant={seoAnalysis.score >= 80 ? "default" : seoAnalysis.score >= 50 ? "secondary" : "destructive"} className="font-mono">
                      Score: {seoAnalysis.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">

                  {/* SEO Score Feedback - Compact */}
                  {seoAnalysis.suggestions.length > 0 && (
                    <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-2 rounded-md border border-amber-200 dark:border-amber-800">
                      <p className="font-semibold mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Improvements:</p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
                        {seoAnalysis.suggestions.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                        {seoAnalysis.suggestions.length > 3 && <li>+ {seoAnalysis.suggestions.length - 3} more...</li>}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label className="text-xs">Meta Title</Label>
                        <CharacterCounter current={charCount.metaTitle} max={120} />
                      </div>
                      <Input {...register("metaTitle")} placeholder={title || ""} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label className="text-xs">Meta Description</Label>
                        <CharacterCounter current={charCount.metaDescription} max={160} />
                      </div>
                      <Textarea {...register("metaDescription")} rows={3} className="resize-none text-sm min-h-[80px]" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Keywords</Label>
                      <Input {...register("metaKeywords")} placeholder="news, tags..." className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">OG Image</Label>
                      <MediaPicker
                        value={ogImage || ""}
                        onSelect={(url) => handleImageSelect("ogImage", url)}
                        type="image"
                        label="Select Social Image"
                      />
                      {ogImage && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Image selected</p>}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs mb-2 block uppercase text-muted-foreground font-bold tracking-wider">Search Link Preview</Label>
                    <div className="scale-90 origin-top-left w-[110%]">
                      <GooglePreview
                        title={metaTitle || title || ""}
                        description={metaDescription || excerpt || ""}
                        slug={slug || ""}
                        minHeight={true}
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>

          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}