"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Eye, Flame, Star, Send, CheckCircle2, XCircle, Clock, Loader2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteNews, submitNewsForReview } from "@/lib/actions/news";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * News Table Component
 */
interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  isPublished: boolean;
  isActive: boolean;
  isBreaking: boolean;
  isFeatured: boolean;
  viewCount: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED" | null;
  author: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  editor: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  categories: Array<{
    menu: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

interface NewsTableProps {
  news: News[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}

export function NewsTable({ news, total, page, totalPages, search: initialSearch }: any) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/dashboard/news?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    setDeleting(true);
    const result = await deleteNews(newsToDelete);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setNewsToDelete(null);

    if (result.success) {
      toast({
        title: "News deleted",
        description: "The news post has been successfully deleted.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete news post",
        variant: "destructive",
      });
    }
  };

  const handleSubmitForReview = async (newsId: string) => {
    setSubmitting(newsId);
    const result = await submitNewsForReview(newsId);
    setSubmitting(null);

    if (result.success) {
      toast({
        title: "Submitted for review",
        description: result.message || "Your news post has been submitted for review.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit news for review",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card/50 p-4 rounded-lg border shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No news posts found. Create your first news post!
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium line-clamp-1" title={item.title}>{item.title}</p>
                          {item.isBreaking && (
                            <Badge variant="destructive" className="gap-1 h-5 text-[10px] px-1.5 py-0">
                              <Flame className="h-3 w-3" />
                              Breaking
                            </Badge>
                          )}
                          {item.isFeatured && (
                            <Badge variant="default" className="gap-1 h-5 text-[10px] px-1.5 py-0">
                              <Star className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.categories.slice(0, 2).map((cat: any) => (
                          <Badge key={cat.menu.id} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            {cat.menu.name}
                          </Badge>
                        ))}
                        {item.categories.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            +{item.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex gap-2 flex-wrap">
                          {/* Status Badge */}
                          {item.status === "PUBLISHED" && (
                            <Badge variant="default" className="gap-1 text-[10px] h-5">
                              <CheckCircle2 className="h-3 w-3" />
                              Published
                            </Badge>
                          )}
                          {item.status === "PENDING" && (
                            <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                          {item.status === "APPROVED" && (
                            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700 text-[10px] h-5">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                          {item.status === "REJECTED" && (
                            <Badge variant="destructive" className="gap-1 text-[10px] h-5">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                          )}
                          {(item.status === "DRAFT" || !item.status) && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              Draft
                            </Badge>
                          )}
                          {!item.isActive && (
                            <Badge variant="destructive" className="text-[10px] h-5">Inactive</Badge>
                          )}
                        </div>
                        {/* Show submit button for contributors with draft/pending status */}
                        {(item.status === "DRAFT" || !item.status) && !item.isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubmitForReview(item.id)}
                            disabled={submitting === item.id}
                            className="h-6 text-[10px] px-2"
                          >
                            {submitting === item.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Submit
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{item.viewCount}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-xs">
                          {item.author.firstName || item.author.lastName
                            ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim()
                            : item.author.username}
                        </p>
                        {item.editor && (
                          <p className="text-[10px] text-muted-foreground">
                            Ed: {item.editor.username}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/news/${item.slug}`} target="_blank">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Live
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/news/${item.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Post
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setNewsToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid gap-4">
          {news.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-card text-muted-foreground">
              No news posts found. Create your first news post!
            </div>
          ) : (
            news.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  {/* Header: Title and Status badges */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium leading-none line-clamp-2">{item.title}</h3>
                      <div className="flex shrink-0 gap-1">
                        {item.isBreaking && <Flame className="h-4 w-4 text-destructive" />}
                        {item.isFeatured && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.status === "PUBLISHED" && (
                        <Badge variant="default" className="gap-1 text-[10px] h-5">
                          <CheckCircle2 className="h-3 w-3" />
                          Published
                        </Badge>
                      )}
                      {item.status === "PENDING" && (
                        <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                      {item.status === "APPROVED" && (
                        <Badge variant="default" className="gap-1 bg-green-600 text-[10px] h-5">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </Badge>
                      )}
                      {item.status === "REJECTED" && (
                        <Badge variant="destructive" className="gap-1 text-[10px] h-5">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      )}
                      {(item.status === "DRAFT" || !item.status) && (
                        <Badge variant="outline" className="text-[10px] h-5">Draft</Badge>
                      )}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Author</span>
                      <span className="text-xs font-medium">
                        {item.author.firstName || item.author.lastName
                          ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim()
                          : item.author.username}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Views</span>
                      <span className="text-xs font-medium">{item.viewCount}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Categories</span>
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map((cat: any) => (
                          <Badge key={cat.menu.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {cat.menu.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 flex gap-2">
                      <Link href={`/dashboard/news/${item.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/news/${item.slug}`} target="_blank" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                          <Eye className="h-3 w-3 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(item.status === "DRAFT" || !item.status) && !item.isPublished && (
                          <DropdownMenuItem onClick={() => handleSubmitForReview(item.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit for Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setNewsToDelete(item.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing {((page - 1) * 30) + 1} to {Math.min(page * 30, total)} of {total} news posts
            </p>
            <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={page === 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  params.set("page", String(page - 1));
                  router.push(`/dashboard/news?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  params.set("page", String(page + 1));
                  router.push(`/dashboard/news?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

