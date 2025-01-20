"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash, X } from "lucide-react"
import { Color, Image, Product, Size, Taxonomy, Taxon } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "@/components/ui/image-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { getMaskedImageUrl } from '@/lib/appwrite-config';
import { TaxonPicker } from "./taxon-picker";
import { formatPrice } from "@/lib/utils";

// Add this type definition
type DecimalType = {
  toNumber(): number;
};

const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ 
    url: z.string(),
    fileId: z.string()
  }).array(),
  price: z.coerce.number().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  taxonIds: z.array(z.string()).default([]),
});

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData: (Omit<Product, 'price'> & {
    price: DecimalType | number; // Changed from Decimal to DecimalType
    images: Image[];
    taxons: Taxon[];
  }) | null;
  colors: Color[];
  sizes: Size[];
  taxonomies: (Taxonomy & {
    taxons: (Taxon & {
      children?: Taxon[];
    })[];
  })[];
  initialTaxons?: Taxon[];
  storeCurrency: string;
  storeLocale: string;
};

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  sizes,
  colors,
  taxonomies,
  initialTaxons = [],
  storeCurrency,
  storeLocale,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit product' : 'Create product';
  const description = initialData ? 'Edit a product.' : 'Add a new product';
  const toastMessage = initialData ? 'Product updated.' : 'Product created.';
  const action = initialData ? 'Save changes' : 'Create';

  // Transform initial data to use masked URLs and handle Decimal price
  const formattedInitialData = initialData ? {
    ...initialData,
    images: initialData.images.map(img => ({
      ...img,
      url: getMaskedImageUrl(img.fileId)
    }))
  } : null;

  const safeParsePrice = (price: DecimalType | number): number => {
    if (typeof price === 'object' && 'toNumber' in price) {
      return price.toNumber();
    }
    return typeof price === 'number' ? price : 0;
  };

  // Use formattedInitialData instead of initialData
  const defaultValues = formattedInitialData ? {
    ...formattedInitialData,
    price: safeParsePrice(formattedInitialData.price),
    taxonIds: initialTaxons?.map(taxon => taxon.id) || [],
  } : {
    name: '',
    images: [],
    price: 0.00,
    colorId: '',
    sizeId: '',
    isFeatured: false,
    isArchived: false,
    taxonIds: [],
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success('Product deleted.');
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
    <AlertModal 
      isOpen={open} 
      onClose={() => setOpen(false)}
      onConfirm={onDelete}
      loading={loading}
    />
     <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload 
                    disabled={loading} 
                    value={field.value.map((image) => image.url)} 
                    onChange={(url) => field.onChange([{ url, fileId: '' }])}
                    onChangeUrl={(url, fileId) => field.onChange([...field.value, { url, fileId }])}
                    onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      disabled={loading} 
                      placeholder="0.00"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Price in {storeCurrency}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>{color.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Featured
                    </FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Archived
                    </FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxonIds"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Classifications</FormLabel>
                  <FormDescription>
                    Select multiple categories from different taxonomies to classify this product.
                  </FormDescription>
                  <div className="space-y-4">
                    <FormControl>
                      <TaxonPicker
                        taxonomies={taxonomies}
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    {field.value?.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-slate-50 dark:bg-slate-900">
                        {field.value.map(id => {
                          const taxon = findTaxonById(taxonomies, id);
                          const taxonomy = findTaxonomyByTaxonId(taxonomies, id);
                          if (!taxon) return null;
                          
                          return (
                            <div 
                              key={id}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full 
                                       bg-white dark:bg-slate-800 border shadow-sm"
                            >
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {taxonomy?.name}
                              </span>
                              <span className="text-slate-400">/</span>
                              <span className="text-slate-800 dark:text-slate-200">
                                {taxon.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                onClick={() => field.onChange(field.value.filter(v => v !== id))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

// Helper functions to find taxon and taxonomy
const findTaxonById = (taxonomies: any[], id: string): Taxon | null => {
  for (const taxonomy of taxonomies) {
    const found = findTaxonInHierarchy(taxonomy.taxons, id);
    if (found) return found;
  }
  return null;
};

const findTaxonInHierarchy = (taxons: any[], id: string): Taxon | null => {
  for (const taxon of taxons) {
    if (taxon.id === id) return taxon;
    if (taxon.children) {
      const found = findTaxonInHierarchy(taxon.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findTaxonomyByTaxonId = (taxonomies: any[], taxonId: string): Taxonomy | null => {
  return taxonomies.find(taxonomy => 
    findTaxonInHierarchy(taxonomy.taxons, taxonId)
  ) || null;
};
