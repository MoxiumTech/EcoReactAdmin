"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Store as StoreIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStoreModal } from "@/hooks/use-store-modal";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: any[];
  disabled?: boolean;
}

export default function StoreSwitcher({
  className,
  items = [],
  disabled
}: StoreSwitcherProps) {
  const storeModal = useStoreModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const currentStore = formattedItems.find((item) => item.value === params.storeId);

  const [open, setOpen] = React.useState(false);

  const onStoreSelect = (store: { value: string, label: string }) => {
    setOpen(false);
    router.push(`/${store.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn(
            "w-full justify-between",
            disabled ? "cursor-default opacity-70" : "hover:bg-primary/5 hover:ring-2 hover:ring-primary/10",
            "ring-offset-background",
            className
          )}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="rounded-md bg-primary/10 p-1">
              <StoreIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate text-sm font-medium">
              {currentStore?.label}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput
            placeholder="Search stores..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandGroup heading="Available Stores">
              {formattedItems.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onStoreSelect(store)}
                  className="text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn(
                      "rounded-md p-1",
                      store.value === currentStore?.value
                        ? "bg-primary/20"
                        : "bg-muted"
                    )}>
                      <StoreIcon className={cn(
                        "h-4 w-4",
                        store.value === currentStore?.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "truncate font-medium",
                      store.value === currentStore?.value && "text-primary"
                    )}>
                      {store.label}
                    </span>
                  </div>
                  {store.value === currentStore?.value && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {!disabled && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    storeModal.onOpen();
                  }}
                  className="text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-muted p-1">
                      <PlusCircle className="h-4 w-4" />
                    </div>
                    <span>Create Store</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
