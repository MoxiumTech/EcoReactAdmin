"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role, Store } from "@prisma/client";
import { Menu, ChevronRight, LogOut } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import StoreSwitcher from "@/components/store-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { handleSignOut } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { useRouteItems } from "./admin/route-items";
import { Separator } from "@/components/ui/separator";
import { useSidebarState } from "@/hooks/use-sidebar-state";

interface SidebarProps {
  store: Store & {
    roleAssignments: Array<{
      role: Role;
    }>;
  };
  stores: Array<Store & {
    roleAssignments: Array<{
      role: Role;
    }>;
  }>;
  isOwner: boolean;
  role?: Role;
}

export function Sidebar({ store, stores, isOwner, role }: SidebarProps) {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const routes = useRouteItems({ isOwner, role });
  const { isCollapsed, setIsCollapsed } = useSidebarState();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [setIsCollapsed]);

  const toggleCategory = (category: string) => {
    if (isCollapsed) return;
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const onSignOut = async () => {
    try {
      await handleSignOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-background z-30",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          "border-r border-border/40",
          isCollapsed ? "w-[70px]" : "w-[280px]"
        )}
      >
        <div className="relative h-full">
          {/* Top header section with gradient background */}
          <div className={cn(
            "h-16 flex items-center px-4",
            "bg-gradient-to-r from-primary/5 to-background",
            "border-b border-border/40"
          )}>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <StoreSwitcher items={stores} disabled={!isOwner} />
              </div>
            )}
            {isCollapsed && store && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {store.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Collapse button with improved styling */}
          <div className="absolute right-0 top-20">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex items-center justify-center w-6 h-12 -mr-3",
                "rounded-l-lg bg-primary/5",
                "transition-all duration-200",
                "border-y border-l border-border/40",
                "hover:bg-primary/10 hover:border-primary/20",
                "group"
              )}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
          
          {/* Main content area */}
          <div className="h-[calc(100%-4rem)] flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-8">
              <nav className="space-y-2">
                {routes.map((route, index) => (
                  <div key={index}>
                    {route.items ? (
                      <Collapsible
                        open={!isCollapsed && openCategories.includes(route.label)}
                        onOpenChange={() => toggleCategory(route.label)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className={cn(
                            "group w-full rounded-lg",
                            "transition-all duration-200",
                            openCategories.includes(route.label)
                              ? "bg-primary/10"
                              : "hover:bg-accent/5",
                            "ring-offset-background",
                            "hover:ring-2 hover:ring-primary/10",
                            isCollapsed && "justify-center"
                          )}>
                            <div className="px-3 py-2.5 flex items-center justify-between">
                              <div className="flex items-center min-w-0 gap-3">
                                {route.icon && (
                                  <div className={cn(
                                    "p-1 rounded-md",
                                    openCategories.includes(route.label)
                                      ? "bg-primary/20"
                                      : "bg-transparent group-hover:bg-primary/10",
                                    "transition-colors"
                                  )}>
                                    <route.icon className={cn(
                                      "h-4 w-4 shrink-0",
                                      openCategories.includes(route.label)
                                        ? "text-primary"
                                        : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                  </div>
                                )}
                                {!isCollapsed && (
                                  <span className={cn(
                                    "text-sm font-medium truncate",
                                    openCategories.includes(route.label)
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-foreground"
                                  )}>
                                    {route.label}
                                  </span>
                                )}
                              </div>
                              {!isCollapsed && (
                                <ChevronRight className={cn(
                                  "h-4 w-4 shrink-0 transition-transform",
                                  openCategories.includes(route.label)
                                    ? "rotate-90 text-primary"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )} />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className={cn(
                            "mt-1 space-y-1",
                            !isCollapsed && "ml-4"
                          )}>
                            {route.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block"
                              >
                                <div className={cn(
                                  "rounded-lg",
                                  "transition-all duration-200 group",
                                  "ring-offset-background",
                                  "hover:ring-2 hover:ring-primary/10",
                                  item.active
                                    ? "bg-primary/10"
                                    : "hover:bg-accent/5",
                                  isCollapsed ? "px-2 py-2" : "px-3 py-2"
                                )}>
                                  <div className="flex items-center min-w-0 gap-3">
                                    <div className={cn(
                                      "p-1 rounded-md",
                                      item.active
                                        ? "bg-primary/20"
                                        : "bg-transparent group-hover:bg-primary/10"
                                    )}>
                                      {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                      <span className={cn(
                                        "text-sm truncate",
                                        item.active
                                          ? "text-primary font-medium"
                                          : "text-muted-foreground group-hover:text-foreground"
                                      )}>
                                        {item.label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : route.href ? (
                      <Link href={route.href} className="block">
                        <div className={cn(
                          "rounded-lg",
                          "transition-all duration-200 group",
                          "ring-offset-background",
                          "hover:ring-2 hover:ring-primary/10",
                          route.active
                            ? "bg-primary/10"
                            : "hover:bg-accent/5",
                          isCollapsed ? "px-2 py-2" : "px-3 py-2.5"
                        )}>
                          <div className="flex items-center min-w-0 gap-3">
                            {route.icon && (
                              <div className={cn(
                                "p-1 rounded-md",
                                route.active
                                  ? "bg-primary/20"
                                  : "bg-transparent group-hover:bg-primary/10"
                              )}>
                                <route.icon className={cn(
                                  "h-4 w-4",
                                  route.active
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )} />
                              </div>
                            )}
                            {!isCollapsed && (
                              <span className={cn(
                                "text-sm truncate",
                                route.active
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}>
                                {route.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                ))}
              </nav>
            </div>
            
            {/* User Role Information */}
            {!isCollapsed && (
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">
                    {isOwner ? 'Owner' : role?.name || 'Staff'}
                  </span>
                  {!isOwner && (
                    <span className="text-xs text-muted-foreground">
                      • {store.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bottom controls */}
            <div className="border-t border-border/40 bg-muted/5">
              <div className={cn(
                "px-3 py-4 space-y-3",
                isCollapsed && "flex flex-col items-center"
              )}>
                <div className={cn(
                  "flex items-center gap-4",
                  isCollapsed ? "justify-center" : "px-2"
                )}>
                  <ThemeToggle /> 
                  {!isCollapsed && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-xs text-muted-foreground">v1.0.0</span>
                    </>
                  )}
                </div>
                {!isCollapsed && <Separator className="bg-border/40" />}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSignOut}
                  className={cn(
                    "w-full flex items-center gap-2 text-muted-foreground",
                    "hover:text-primary hover:bg-primary/5",
                    isCollapsed ? "px-0 justify-center" : "px-2",
                    "transition-colors"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && "Sign Out"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 z-20",
          isCollapsed ? "hidden" : "lg:hidden"
        )}
        onClick={() => setIsCollapsed(true)}
      />
    </>
  );
}
