"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { approveNews, rejectNews } from "@/lib/actions/news";
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
import { Label } from "@/components/ui/label";

/**
 * Pending News Table Component
 * Shows news posts pending review with approve/reject actions
 */
interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  author: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  categories: Array<{
    menu: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface PendingNewsTableProps {
  news: News[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}

export function PendingNewsTable({ news, total, page, totalPages, search: initialSearch }: PendingNewsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch || "");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [newsToReview, setNewsToReview] = useState<News | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/dashboard/news/pending?${params.toString()}`);
  };

  const handleApprove = async () => {
    if (!newsToReview) return;

    setProcessing(true);
    const result = await approveNews(newsToReview.id, reviewComment || undefined);
    setProcessing(false);
    setApproveDialogOpen(false);
    setNewsToReview(null);
    setReviewComment("");

    if (result.success) {
      toast({
        title: "News approved",
        description: result.message || "The news post has been approved and published.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve news post",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!newsToReview) return;

    if (!reviewComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please provide a reason for rejecting this news post.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const result = await rejectNews(newsToReview.id, reviewComment);
    setProcessing(false);
    setRejectDialogOpen(false);
    setNewsToReview(null);
    setReviewComment("");

    if (result.success) {
      toast({
        title: "News rejected",
        description: result.message || "The news post has been rejected.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject news post",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search pending news posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No pending news posts to review.
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat.menu.id} variant="outline" className="text-xs">
                            {cat.menu.name}
                          </Badge>
                        ))}
                        {item.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {item.author.firstName || item.author.lastName
                            ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim()
                            : item.author.username}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.author.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/news/${item.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setNewsToReview(item);
                            setApproveDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setNewsToReview(item);
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 30) + 1} to {Math.min(page * 30, total)} of {total} pending news posts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  params.set("page", String(page - 1));
                  router.push(`/dashboard/news/pending?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  params.set("page", String(page + 1));
                  router.push(`/dashboard/news/pending?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve News Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve and publish this news post?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newsToReview && (
              <div className="space-y-2">
                <p className="font-medium">{newsToReview.title}</p>
                <p className="text-sm text-muted-foreground">
                  By {newsToReview.author.firstName || newsToReview.author.lastName
                    ? `${newsToReview.author.firstName || ""} ${newsToReview.author.lastName || ""}`.trim()
                    : newsToReview.author.username}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="approve-comment">Review Comment (Optional)</Label>
              <Textarea
                id="approve-comment"
                placeholder="Add any comments or notes about this approval..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve & Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject News Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this news post. This will be visible to the author.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newsToReview && (
              <div className="space-y-2">
                <p className="font-medium">{newsToReview.title}</p>
                <p className="text-sm text-muted-foreground">
                  By {newsToReview.author.firstName || newsToReview.author.lastName
                    ? `${newsToReview.author.firstName || ""} ${newsToReview.author.lastName || ""}`.trim()
                    : newsToReview.author.username}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reject-comment">Rejection Reason *</Label>
              <Textarea
                id="reject-comment"
                placeholder="Please explain why this news post is being rejected..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This comment will be visible to the author.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !reviewComment.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

