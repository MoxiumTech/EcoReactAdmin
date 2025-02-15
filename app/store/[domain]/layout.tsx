import { Navbar } from "./components/navbar-menu";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "react-hot-toast";
import { StorefrontChat } from "@/components/storefront/chat/storefront-chat";
import { getStoreByDomain } from "@/actions/get-store-by-domain";
import { getCustomerSession } from "@/lib/auth";
import { StoreSettingsProvider } from "@/hooks/use-store-settings";

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  // Get store data and customer session
  const store = await getStoreByDomain(params.domain);
  if (!store) {
    return null;
  }

  const session = await getCustomerSession();

  // Get taxonomies with proper type transformation
  const rawTaxonomies = await prismadb.taxonomy.findMany({
    where: {
      storeId: store.id
    },
    include: {
      taxons: {
        where: {
          parentId: null
        },
        orderBy: {
          position: 'asc'
        },
        include: {
          children: {
            orderBy: {
              position: 'asc'
            },
            include: {
              children: {
                orderBy: {
                  position: 'asc'
                }
              }
            }
          }
        }
      }
    }
  });

  // Transform taxonomies to match expected type
  const taxonomies = rawTaxonomies.map(tax => ({
    id: tax.id,
    name: tax.name,
    taxons: tax.taxons.map(taxon => ({
      id: taxon.id,
      name: taxon.name,
      permalink: taxon.permalink || taxon.id, // Fallback to id if permalink is null
      children: taxon.children.map(child => ({
        id: child.id,
        name: child.name,
        permalink: child.permalink || child.id,
        children: child.children.map(grandChild => ({
          id: grandChild.id,
          name: grandChild.name,
          permalink: grandChild.permalink || grandChild.id,
          children: [] // Leaf node
        }))
      }))
    }))
  }));

  return (
    <div className="h-full">
      <StoreSettingsProvider storeId={store.id}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Navbar 
            taxonomies={taxonomies}
            store={{
              id: store.id,
              name: store.name,
              logoUrl: store.logoUrl
            }}
          />
          <main className="min-h-screen bg-background flex flex-col">
            {children}
          </main>
          <footer className="bg-background border-t py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} {store.name}. All rights reserved.
              </p>
            </div>
          </footer>
          <StorefrontChat storeId={store.id} customerId={session?.customerId} />
        </ThemeProvider>
      </StoreSettingsProvider>
    </div>
  );
}
