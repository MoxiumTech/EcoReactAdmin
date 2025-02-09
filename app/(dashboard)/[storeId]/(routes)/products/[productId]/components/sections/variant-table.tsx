import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";
import { VariantForm } from "./variant-form";
import { Modal } from "@/components/ui/modal";
import { Loader } from "@/components/ui/loader";

interface VariantTableProps {
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    isVisible: boolean;
    color?: { name: string; value: string };
    size?: { name: string; value: string };
    stockItems?: Array<{
      count: number;
      stockStatus: string;
    }>;
  }>;
  onUpdate: () => void;
  colors: Array<{ id: string; name: string; value: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
  isLoading?: boolean;
}

export const VariantTable: React.FC<VariantTableProps> = ({
  variants = [],
  onUpdate,
  colors = [],
  sizes = [],
  isLoading = false
}) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const onDelete = async (variantId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/variants/${variantId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete variant');
      }
      
      onUpdate();
      toast.success("Variant deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Product Variants
          </h3>
        </div>
        <Loader 
        simulateProgress={true}
        status="Loading your Variants..."
        />
      </div>
    );
  }

  const safeVariants = Array.isArray(variants) ? variants : [];
  const safeColors = Array.isArray(colors) ? colors : [];
  const safeSizes = Array.isArray(sizes) ? sizes : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Product Variants ({safeVariants.length})
        </h3>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingVariant(null);
          }}
          disabled={loading || safeColors.length === 0 || safeSizes.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeVariants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.name || 'Unnamed Variant'}</TableCell>
                <TableCell>{variant.sku || 'No SKU'}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(variant.price || 0)}
                </TableCell>
                <TableCell>
                  {variant.stockItems && variant.stockItems[0] ? (
                    <div className="flex items-center gap-x-2">
                      <span>{variant.stockItems[0].count}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        variant.stockItems[0].stockStatus === 'in_stock' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {variant.stockItems[0].stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  ) : (
                    0
                  )}
                </TableCell>
                <TableCell>
                  {variant.color ? (
                    <div className="flex items-center gap-x-2">
                      <div 
                        className="h-4 w-4 rounded-full border" 
                        style={{ backgroundColor: variant.color.value }}
                      />
                      {variant.color.name}
                    </div>
                  ) : (
                    'No color'
                  )}
                </TableCell>
                <TableCell>{variant.size?.name || 'No size'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    variant.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {variant.isVisible ? "Active" : "Hidden"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVariant(variant);
                        setIsCreating(false);
                      }}
                      disabled={loading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                        setEditingVariant(variant);
                      }}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {safeVariants.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  {safeColors.length === 0 || safeSizes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Please add colors and sizes before creating variants.
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No variants found. Click the &quot;Add Variant&quot; button to create one.
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => editingVariant && onDelete(editingVariant.id)}
        loading={loading}
      />

      {(isCreating || editingVariant) && (
        <Modal
          title={isCreating ? "Create Variant" : "Edit Variant"}
          description={isCreating ? "Add a new product variant" : "Edit product variant details"}
          isOpen={true}
          onClose={() => {
            setIsCreating(false);
            setEditingVariant(null);
          }}
        >
          <div className="mt-4">
            <VariantForm
              colors={safeColors}
              sizes={safeSizes}
              initialData={editingVariant}
              productId={params.productId as string}
              onSubmit={async (success: boolean) => {
                if (success) {
                  await onUpdate();
                  setIsCreating(false);
                  setEditingVariant(null);
                }
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
