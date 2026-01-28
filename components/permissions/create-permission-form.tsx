"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPermission } from "@/lib/actions/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const createPermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  slug: z.string().min(1, "Permission slug is required"),
  description: z.string().optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  isActive: z.boolean().default(true),
});

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;

const resources = ["user", "role", "permission", "menu", "audit", "dashboard"];
const actions = ["create", "read", "update", "delete", "manage"];

export function CreatePermissionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmit = async (data: CreatePermissionFormData) => {
    setLoading(true);
    try {
      const result = await createPermission(data);

      if (result.success) {
        toast({
          title: "Permission created",
          description: "The permission has been successfully created.",
        });
        router.push("/dashboard/permissions");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create permission",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Information</CardTitle>
        <CardDescription>Define a new permission for access control</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                placeholder="Create User"
                {...register("name")}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Permission Slug *</Label>
              <Input
                id="slug"
                placeholder="user.create"
                {...register("slug")}
                disabled={loading}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                Format: resource.action (e.g., user.create)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource">Resource *</Label>
              <Select
                onValueChange={(value) => setValue("resource", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resource && (
                <p className="text-sm text-destructive">{errors.resource.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Select
                onValueChange={(value) => setValue("action", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.action && (
                <p className="text-sm text-destructive">{errors.action.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Permission description..."
              {...register("description")}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/50">
            <input
              type="checkbox"
              id="isActive"
              checked={watch("isActive")}
              onChange={(e) => setValue("isActive", e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer flex-1">
              Active Status
            </Label>
            <Badge variant={watch("isActive") ? "default" : "secondary"}>
              {watch("isActive") ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Permission
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

