import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Wine Management
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href={`http://${process.env.ADMIN_DOMAIN}/signin`}>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href={`http://${process.env.ADMIN_DOMAIN}/signup`}>
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
