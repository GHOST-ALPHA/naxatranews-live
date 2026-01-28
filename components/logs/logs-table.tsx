"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

/**
 * Audit Logs Table Component
 * Displays system activity logs
 */
interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  description: string | null;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface LogsTableProps {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export function LogsTable({ logs, total, page, totalPages }: LogsTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{log.user.username}</p>
                      <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{log.resource}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground" title={log.description || ""}>
                    {log.description || "-"}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {log.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        {logs.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-card text-muted-foreground">
            No logs found
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{log.user.username}</span>
                    <span className="text-xs text-muted-foreground">({log.ipAddress || "Unknown IP"})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] shrink-0">{log.action}</Badge>
              </div>

              <div className="grid gap-2 text-sm pt-2 border-t">
                <div className="flex gap-2 text-xs">
                  <span className="text-muted-foreground font-medium min-w-[60px]">Resource:</span>
                  <Badge variant="outline" className="font-mono text-[10px] px-1 py-0 h-5">{log.resource}</Badge>
                </div>
                {log.description && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-muted-foreground font-medium min-w-[60px]">Details:</span>
                    <span className="text-muted-foreground">{log.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("page", String(page - 1));
                router.push(`/dashboard/logs?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("page", String(page + 1));
                router.push(`/dashboard/logs?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

