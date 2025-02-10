'use client';

import * as z from "zod";
import { Trash, ExternalLink, Globe, PaintBucket, Image as ImageIcon, Shield, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { ExtendedStore } from "../types";
import { Badge } from "@/components/ui/badge";

interface SettingsFormProps {
  initialData: ExtendedStore;
}

const formSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  customCss: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  currency: z.string().min(1).default('USD'),
});

const currencies = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Japanese Yen (JPY)', value: 'JPY' },
  { label: 'Canadian Dollar (CAD)', value: 'CAD' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
];

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testDataOpen, setTestDataOpen] = useState(false);
  const [testDataLoading, setTestDataLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      domain: initialData.domain || '',
      customCss: initialData.customCss || '',
      logoUrl: initialData.logoUrl || '',
      faviconUrl: initialData.faviconUrl || '',
      currency: initialData.currency || 'USD',
    }
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success('Store updated successfully.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const loadTestData = async () => {
    try {
      setTestDataLoading(true);
      await axios.post(`/api/${params.storeId}/test-data`);
      router.refresh();
      toast.success('Test data loaded successfully.');
    } catch (error) {
      toast.error('Something went wrong loading test data.');
    } finally {
      setTestDataLoading(false);
      setTestDataOpen(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.push('/');
      toast.success('Store deleted successfully.');
    } catch (error) {
      toast.error('Make sure you removed all products and categories first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const storeDomain = initialData.domain
    ? process.env.NODE_ENV === 'development'
      ? `http://${initialData.domain}.lvh.me:3000`
      : `https://${initialData.domain}`
    : null;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <AlertModal
        isOpen={testDataOpen}
        onClose={() => setTestDataOpen(false)}
        onConfirm={loadTestData}
        loading={testDataLoading}
        title="Load Test Data"
        description="This will add sample data to your store. This action cannot be undone. Are you sure you want to continue?"
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Store Settings"
          description="Manage your store configuration"
        />
        <div className="flex items-center gap-x-2">
          {storeDomain && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(storeDomain, '_blank')}
              className="flex items-center gap-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Store
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/${params.storeId}/settings/security`)}
            className="flex items-center gap-x-2"
          >
            <Shield className="h-4 w-4" />
            Security Settings
          </Button>
          <Button
            disabled={loading || testDataLoading}
            variant="secondary"
            size="sm"
            onClick={() => setTestDataOpen(true)}
          >
            Load Test Data
          </Button>
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-medium">General Settings</h2>
              </div>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="My Awesome Store" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Currency</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={loading}
                          {...field}
                        >
                          {currencies.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Domain</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder={process.env.NODE_ENV === 'development'
                            ? "e.g., store1"
                            : "e.g., store1.yourdomain.com"}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        {process.env.NODE_ENV === 'development'
                          ? "Enter only the store name (e.g., &apos;store1&apos; for store1.lvh.me:3000)"
                          : "Enter your full domain (e.g., &apos;store1.yourdomain.com&apos;)"}
                      </FormDescription>
                      {storeDomain && (
                        <Badge variant="secondary" className="mt-2">
                          {storeDomain}
                        </Badge>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-medium">Store Branding</h2>
              </div>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Logo</FormLabel>
                        <FormControl>
                          <ImageUpload 
                            value={field.value ? [field.value] : []} 
                            disabled={loading} 
                            onChange={(url) => field.onChange(url)}
                            onRemove={() => field.onChange('')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Favicon</FormLabel>
                        <FormControl>
                          <ImageUpload 
                            value={field.value ? [field.value] : []} 
                            disabled={loading} 
                            onChange={(url) => field.onChange(url)}
                            onRemove={() => field.onChange('')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PaintBucket className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-medium">Store Customization</h2>
              </div>
              <FormField
                control={form.control}
                name="customCss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom CSS</FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={loading}
                        placeholder="Add custom CSS for your store..."
                        {...field}
                        value={field.value || ''}
                        className="min-h-[150px] font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom CSS to customize your store&apos;s appearance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </div>

          <div className="flex justify-end gap-x-2">
            <Button
              disabled={loading}
              type="submit"
              className="ml-auto"
              size="lg"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
      <Separator className="my-4" />
      <ApiAlert 
        title="NEXT_PUBLIC_API_URL" 
        variant="public" 
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};
