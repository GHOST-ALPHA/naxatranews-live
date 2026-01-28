"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, AlertCircle, Shield, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePermission } from "@/lib/actions/permissions";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/**
 * Permissions Table Component
 * Displays permissions grouped by resource
 */
interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  resource: string;
  action: string;
  isActive: boolean;
  roleCount: number;
  createdAt: Date;
}

interface PermissionsTableProps {
  permissions: Permission[];
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async () => {
    if (!permissionToDelete) return;

    setDeleting(true);
    const result = await deletePermission(permissionToDelete);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setPermissionToDelete(null);

    if (result.success) {
      toast({
        title: "Permission deleted",
        description: "The permission has been successfully deleted.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete permission",
        variant: "destructive",
      });
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group permissions by resource
  const grouped = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "read": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "update": return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
      case "delete": return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      case "manage": return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions by name, slug, or resource..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md bg-background"
        />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10 dashed">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground">No permissions found</h3>
          <p className="text-sm text-muted-foreground/60">Try adjusting your search query</p>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={Object.keys(grouped)} className="space-y-4">
          {Object.entries(grouped).map(([resource, perms]) => (
            <AccordionItem
              key={resource}
              value={resource}
              className="border rounded-lg bg-card shadow-sm overflow-hidden data-[state=open]:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold capitalize text-base leading-none">{resource}</h3>
                    <p className="text-xs text-muted-foreground font-normal mt-1">
                      {perms.length} permission{perms.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[250px]">Permission Name</TableHead>
                        <TableHead className="w-[200px]">Slug</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-center">Roles Assigned</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perms.map((perm) => (
                        <TableRow key={perm.id} className="hover:bg-muted/30 group">
                          <TableCell className="font-medium">
                            <span className="group-hover:text-primary transition-colors">{perm.name}</span>
                            {perm.description && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{perm.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded border font-mono text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-colors">
                              {perm.slug}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("capitalize font-normal", getActionColor(perm.action))}>
                              {perm.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.roleCount > 0 ? (
                              <Badge variant="secondary" className="font-normal rounded-full h-5 px-2">
                                {perm.roleCount}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {perm.isActive ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span className={cn("text-sm", perm.isActive ? "text-foreground" : "text-muted-foreground")}>
                                {perm.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/dashboard/permissions/${perm.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setPermissionToDelete(perm.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y border-t">
                  {perms.map((perm) => (
                    <div key={perm.id} className="p-4 space-y-3 hover:bg-muted/10 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-sm">{perm.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded border">{perm.slug}</code>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("capitalize text-[10px] px-1.5 py-0 h-5", getActionColor(perm.action))}>
                          {perm.action}
                        </Badge>
                      </div>

                      {perm.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{perm.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>{perm.roleCount} roles</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn("h-1.5 w-1.5 rounded-full", perm.isActive ? "bg-green-500" : "bg-gray-300")} />
                            <span>{perm.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/permissions/${perm.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => {
                              setPermissionToDelete(perm.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this permission? This action cannot be undone.
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
    </div>
  );
}
