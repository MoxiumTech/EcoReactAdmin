import { Navbar } from "./components/navbar";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "react-hot-toast";
import { StorefrontChat } from "@/components/storefront/chat/storefront-chat";
import { getStoreByDomain } from "@/actions/get-store-by-domain";
import { getCustomerSession } from "@/lib/auth";

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
  console.log("Customer session in layout:", session); // Debug log

  // Get taxonomies with their taxons for navigation
  const taxonomies = await prismadb.$queryRaw<Array<any>>`
    WITH RECURSIVE TaxonTree AS (
      -- Base case: get root level taxons
      SELECT 
        tx.id,
        tx.name,
        tx.permalink,
        tx."taxonomyId",
        tx."parentId",
        tx.position
      FROM "Taxon" tx
      WHERE tx."parentId" IS NULL
      
      UNION ALL
      
      -- Recursive case: get children
      SELECT 
        child.id,
        child.name,
        child.permalink,
        child."taxonomyId",
        child."parentId",
        child.position
      FROM "Taxon" child
      JOIN TaxonTree parent ON parent.id = child."parentId"
    )
    SELECT 
      t.*,
      jsonb_agg(
        CASE WHEN tx.id IS NULL THEN NULL
        ELSE jsonb_build_object(
          'id', tx.id,
          'name', tx.name,
          'permalink', tx.permalink,
          'children', (
            WITH ChildrenAgg AS (
              SELECT 
                c.id,
                c.name,
                c.permalink,
                c.position,
                (
                  SELECT jsonb_agg(
                    jsonb_build_object(
                      'id', gc.id,
                      'name', gc.name,
                      'permalink', gc.permalink
                    ) ORDER BY gc.position
                  )
                  FROM TaxonTree gc
                  WHERE gc."parentId" = c.id
                ) as children
              FROM TaxonTree c
              WHERE c."parentId" = tx.id
            )
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', ca.id,
                'name', ca.name,
                'permalink', ca.permalink,
                'children', COALESCE(ca.children, '[]'::jsonb)
              ) ORDER BY ca.position
            )
            FROM ChildrenAgg ca
          )
        )
        END ORDER BY tx.position
      ) FILTER (WHERE tx.id IS NOT NULL) as taxons
    FROM "Taxonomy" t
    LEFT JOIN TaxonTree tx ON tx."taxonomyId" = t.id AND tx."parentId" IS NULL
    WHERE t."storeId" = (
      SELECT id FROM "Store" WHERE domain = ${params.domain}
    )
    GROUP BY t.id
  `;

  return (
    <div className="h-full">
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
              © {new Date().getFullYear()} Store. All rights reserved.
            </p>
          </div>
        </footer>
        <StorefrontChat storeId={store.id} customerId={session?.customerId} />
      </ThemeProvider>
    </div>
  );
}
