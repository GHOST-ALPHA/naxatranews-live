"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile, changePassword } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Shield, Lock, LayoutDashboard, Mail, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    isActive: boolean;
    roles: Array<{ id: string; name: string; slug: string }>;
    createdAt: Date;
    lastLogin: Date | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user.email,
      username: user.username,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    setProfileLoading(true);
    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
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
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        toast({
          title: "Password changed",
          description: "Your password has been successfully changed.",
        });
        resetPassword();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to change password",
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
      setPasswordLoading(false);
    }
  };

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || user.username.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative group overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start z-10">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar || ""} alt={user.username} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm mt-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {user.roles.map((role) => (
                <Badge key={role.id} variant="secondary" className="px-3 py-1 bg-secondary/50 backdrop-blur-sm border-secondary-foreground/10">
                  {role.name}
                </Badge>
              ))}
              <Badge
                variant={user.isActive ? "default" : "destructive"}
                className={`px-3 py-1 ${user.isActive ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200 dark:border-green-900" : ""}`}
              >
                {user.isActive ? "Active Account" : "Inactive Account"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="flex justify-center md:justify-start mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 p-1 backdrop-blur-md rounded-full border">
            <TabsTrigger value="general" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
            <TabsTrigger value="account" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Account</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="border-none shadow-xl bg-background/40 backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Manage your public profile information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">First Name</Label>
                    <Input
                      id="firstName"
                      {...registerProfile("firstName")}
                      disabled={profileLoading}
                      className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Last Name</Label>
                    <Input
                      id="lastName"
                      {...registerProfile("lastName")}
                      disabled={profileLoading}
                      className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Username</Label>
                  <Input
                    id="username"
                    {...registerProfile("username")}
                    disabled={profileLoading}
                    className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                  />
                  {profileErrors.username && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <span>•</span> {profileErrors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile("email")}
                    disabled={profileLoading}
                    className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                  />
                  {profileErrors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <span>•</span> {profileErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button type="submit" disabled={profileLoading} className="min-w-[120px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                    {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="border-none shadow-xl bg-background/40 backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Ensure your account stays secure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword("currentPassword")}
                    disabled={passwordLoading}
                    className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <span>•</span> {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword("newPassword")}
                      disabled={passwordLoading}
                      className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <span>•</span> {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword("confirmPassword")}
                      disabled={passwordLoading}
                      className="bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <span>•</span> {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button type="submit" disabled={passwordLoading} variant="destructive" className="min-w-[140px] shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02]">
                    {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="border-none shadow-xl bg-background/40 backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Key information about your account activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Member Since</p>
                    <p className="font-semibold text-lg">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors">
                  <div className="p-3 rounded-full bg-green-500/10 text-green-600">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Last Login</p>
                    <p className="font-semibold text-lg">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                        : "Never"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
