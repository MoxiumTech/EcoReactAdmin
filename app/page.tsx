import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Premium Wine Management Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your wine business with our comprehensive management solution. From inventory to sales, we've got you covered.
                </p>
              </div>
              <div className="space-x-4">
                <Link href={`http://${process.env.ADMIN_DOMAIN}/signin`}>
                  <Button>Sign In</Button>
                </Link>
                <Link href={`http://${process.env.ADMIN_DOMAIN}/signup`}>
                  <Button variant="outline">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 items-center">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-2xl font-bold">Inventory Management</h3>
                <p className="text-gray-500 dark:text-gray-400">Keep track of your wine inventory with ease</p>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-2xl font-bold">Sales Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">Detailed insights into your sales performance</p>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-2xl font-bold">Customer Management</h3>
                <p className="text-gray-500 dark:text-gray-400">Build lasting relationships with your customers</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to get started?</h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join hundreds of wine businesses already using our platform
              </p>
              <Link href={`http://${process.env.ADMIN_DOMAIN}/signup`}>
                <Button size="lg">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
