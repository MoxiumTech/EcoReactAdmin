"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash, X, Plus, Edit } from "lucide-react"
import { Color, Image, Product, Size, Taxonomy, Taxon, Variant } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ImageUpload from "@/components/ui/image-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { getMaskedImageUrl } from '@/lib/appwrite-config';
import { TaxonPicker } from "./taxon-picker";
import { formatPrice } from "@/lib/utils";
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

// Add this type definition
type DecimalType = {
  toNumber(): number;
};

const formSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  images: z.object({ 
    url: z.string(),
    fileId: z.string()
  }).array(),
  price: z.coerce.number().nullable(),
  costPrice: z.coerce.number().nullable().optional(),
  compareAtPrice: z.coerce.number().nullable().optional(),
  status: z.string().default('draft'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  sku: z.string().optional(),
  availableOn: z.date().optional().nullable(),
  discontinueOn: z.date().optional().nullable(),
  taxCategory: z.string().optional(),
  shippingCategory: z.string().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  depth: z.coerce.number().optional(),
  variants: z.array(z.object({
    colorId: z.string().optional(),
    sizeId: z.string().optional(),
    price: z.coerce.number().min(0),
    sku: z.string().optional(),
    stockCount: z.number().min(0).default(0)
  })).default([]),
  taxonIds: z.array(z.string()).default([]),
  brandId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>

interface ProductVariant extends Variant {
  color?: Color | null;
  size?: Size | null;
  stockItems?: { count: number }[];
}

interface ProductFormProps {
  initialData: {
    id: string;
    name: string;
    description?: string | null;
    images: Image[];
    price: number;
    costPrice?: number | null;
    compareAtPrice?: number | null;
    taxRate?: number | null;
    weight?: number | null;
    height?: number | null;
    width?: number | null;
    depth?: number | null;
    status: string;
    taxons: Taxon[];
    variants?: ProductVariant[];
  } | null;
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
  brands?: { id: string; name: string }[];
}

const VariantsTable = ({ 
  variants, 
  storeId, 
  onDelete 
}: { 
  variants: ProductVariant[], 
  storeId: string,
  onDelete: (id: string) => void
}) => {
  const router = useRouter();
  
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => row.original.color?.name || 'N/A'
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => row.original.size?.name || 'N/A'
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatPrice(parseFloat(String(row.original.price)))
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => row.original.sku || 'N/A'
    },
    {
      accessorKey: "stockCount",
      header: "Stock",
      cell: ({ row }) => row.original.stockItems?.[0]?.count || 0
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${storeId}/variants/${row.original.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return <DataTable columns={columns} data={variants} />;
};

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  sizes,
  colors,
  taxonomies,
  initialTaxons = [],
  storeCurrency,
  storeLocale,
  brands = []
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
    })),
    variants: initialData.variants?.map(variant => ({
      colorId: variant.colorId || '',
      sizeId: variant.sizeId || '',
      price: typeof variant.price === 'object' && 'toNumber' in variant.price 
        ? variant.price.toNumber() 
        : parseFloat(String(variant.price)) || 0,
      sku: variant.sku || '',
      stockCount: variant.stockItems?.[0]?.count || 0
    })) || []
  } : null;

  const safeParsePrice = (price: DecimalType | number): number => {
    if (typeof price === 'object' && 'toNumber' in price) {
      return price.toNumber();
    }
    return typeof price === 'number' ? price : 0;
  };

  const defaultValues = formattedInitialData ? {
    ...formattedInitialData,
    price: safeParsePrice(formattedInitialData.price),
    taxonIds: initialTaxons?.map(taxon => taxon.id) || [],
  } : {
    name: '',
    images: [],
    price: 0.00,
    taxonIds: [],
    variants: []
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  // Add example options
  const allColors = [
    { id: "example-1", name: "Example - Red" },
    { id: "example-2", name: "Example - Blue" },
    ...colors
  ];

  const allSizes = [
    { id: "example-1", name: "Example - Small" },
    { id: "example-2", name: "Example - Medium" },
    ...sizes
  ];

  // Add a function to handle variant addition with optional fields
  const handleAddVariant = () => {
    append({
      colorId: undefined, // Make it optional
      sizeId: undefined,  // Make it optional
      price: 0,
      sku: '',
      stockCount: 0
    });
  };

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

  const handleDeleteVariant = async (variantId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/variants/${variantId}`);
      router.refresh();
      toast.success('Variant deleted.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="product-url-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {initialData && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Heading title="Variants" description="Manage product variants" />
                  <Button
                    onClick={() => router.push(`/${params.storeId}/variants/new?productId=${initialData.id}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
                {initialData.variants && initialData.variants.length > 0 ? (
                  <div className="rounded-md border">
                    <VariantsTable 
                      variants={initialData.variants}
                      storeId={params.storeId}
                      onDelete={handleDeleteVariant}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 bg-slate-100 dark:bg-slate-900 rounded-md">
                    <p className="text-sm text-muted-foreground">No variants found</p>
                  </div>
                )}
              </div>
            </>
          )}
          
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

// Add type guard to prevent infinite recursion
const findTaxonInHierarchy = (taxons: TaxonWithChildren[], id: string): Taxon | null => {
  for (const taxon of taxons) {
    if (taxon.id === id) return taxon;
    if (taxon.children && Array.isArray(taxon.children)) {
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
