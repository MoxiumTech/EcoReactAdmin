import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prismadb from '@/lib/prismadb';
import { Sidebar } from "@/components/sidebar";
import { verifyAuth } from '@/lib/auth';
import Navbar from '@/components/navbar';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/sign-in');
  }

  const session = await verifyAuth(token);

  if (!session?.user) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: session.user.id,
    }
  });

  if (!store) {
    redirect('/');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: session.user.id,
    }
  });

  return (
    <div className="relative h-full">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
        <Sidebar store={store} />
      </div>
      <main className="md:pl-72">
        <Navbar stores={stores} />
        {children}
      </main>
    </div>
  );
}
