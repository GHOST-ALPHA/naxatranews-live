"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePermission } from "@/lib/actions/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const updatePermissionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  resource: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

type UpdatePermissionFormData = z.infer<typeof updatePermissionSchema>;

const resources = ["user", "role", "permission", "menu", "audit", "dashboard"];
const actions = ["create", "read", "update", "delete", "manage"];

interface EditPermissionFormProps {
  permission: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    resource: string;
    action: string;
    isActive: boolean;
  };
}

export function EditPermissionForm({ permission }: EditPermissionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdatePermissionFormData>({
    resolver: zodResolver(updatePermissionSchema),
    defaultValues: {
      id: permission.id,
      name: permission.name,
      slug: permission.slug,
      description: permission.description || "",
      resource: permission.resource,
      action: permission.action,
      isActive: permission.isActive,
    },
  });

  const onSubmit = async (data: UpdatePermissionFormData) => {
    setLoading(true);
    try {
      const result = await updatePermission(data);

      if (result.success) {
        toast({
          title: "Permission updated",
          description: "The permission has been successfully updated.",
        });
        router.push("/dashboard/permissions");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update permission",
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
        <CardDescription>Update permission details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Permission Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <Select
                value={watch("resource")}
                onValueChange={(value) => setValue("resource", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={watch("action")}
                onValueChange={(value) => setValue("action", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
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
              Update Permission
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

