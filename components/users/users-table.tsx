"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, MoreVertical, Shield, Calendar, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Users Table Component
 * Displays users in a table with actions
 */
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: Array<{ id: string; name: string; slug: string }>;
  createdAt: Date;
  lastLogin: Date | null;
}

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}

export function UsersTable({ users, total, page, totalPages, search: initialSearch }: UsersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    const result = await deleteUser(userToDelete);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setUserToDelete(null);

    if (result.success) {
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
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
                placeholder="Search users..."
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

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.firstName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : user.username}
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/users/${user.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setUserToDelete(user.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
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
          {users.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-card text-muted-foreground">
              No users found matching your search.
            </div>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.firstName || user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.username}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? "bg-emerald-500 hover:bg-emerald-600 h-5 text-[10px]" : "h-5 text-[10px]"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Roles</span>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Joined</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/dashboard/users/${user.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => {
                        setUserToDelete(user.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} users
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
                  router.push(`/dashboard/users?${params.toString()}`);
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
                  router.push(`/dashboard/users?${params.toString()}`);
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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

