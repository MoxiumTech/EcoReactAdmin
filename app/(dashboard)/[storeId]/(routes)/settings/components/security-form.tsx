"use client";

import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, Loader2, ArrowLeft, Mail, Lock, Shield, AlertTriangle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { AlertModal } from "@/components/modals/alert-modal";

interface SecurityFormProps {
  currentEmail: string;
}

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  currentPassword: z.string().min(1, "Current password is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const SecurityForm: React.FC<SecurityFormProps> = ({ currentEmail }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<'email' | 'password'>('email');

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: currentEmail,
      currentPassword: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitEmail = async (data: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, currentPassword: data.currentPassword }),
      });

      if (!response.ok) throw new Error('Failed to update email');
      toast.success('Email updated successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });

      if (!response.ok) throw new Error('Failed to update password');
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setAlertOpen(false);
    if (actionType === 'email') {
      emailForm.handleSubmit(onSubmitEmail)();
    } else {
      passwordForm.handleSubmit(onSubmitPassword)();
    }
  };

  return (
    <div className="w-full">
      <AlertModal 
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={handleConfirm}
        title="Warning: Security Change"
        description="You're about to change your security settings. This action cannot be undone. Are you sure?"
        loading={loading}
      />

      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Heading
          title="Security Settings"
          description="Manage your account security settings"
        />
      </div>
      <Separator className="mb-6" />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-medium">Account Security</h2>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="email" className="w-[200px]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Update Email
              </div>
            </TabsTrigger>
            <TabsTrigger value="password" className="w-[200px]">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-4 space-y-4">
            <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-900 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Changing your email will require re-verification</p>
            </div>

            <Form {...emailForm}>
              <form onSubmit={(e) => { e.preventDefault(); setActionType('email'); setAlertOpen(true); }} className="space-y-6">
                <div className="grid gap-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter new email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword.current ? "text" : "password"}
                              placeholder="Enter your current password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(prev => ({
                                ...prev,
                                current: !prev.current
                              }))}
                            >
                              {showPassword.current ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Email
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="password" className="mt-4 space-y-4">
            <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-900 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Password Requirements:</p>
                <ul className="text-sm list-disc list-inside mt-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={(e) => { e.preventDefault(); setActionType('password'); setAlertOpen(true); }} className="space-y-6">
                <div className="grid gap-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword.current ? "text" : "password"}
                              placeholder="Enter your current password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(prev => ({
                                ...prev,
                                current: !prev.current
                              }))}
                            >
                              {showPassword.current ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword.new ? "text" : "password"}
                              placeholder="Enter your new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(prev => ({
                                ...prev,
                                new: !prev.new
                              }))}
                            >
                              {showPassword.new ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword.confirm ? "text" : "password"}
                              placeholder="Confirm your new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(prev => ({
                                ...prev,
                                confirm: !prev.confirm
                              }))}
                            >
                              {showPassword.confirm ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
