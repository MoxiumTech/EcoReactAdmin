import { redirect } from 'next/navigation';
import { getAdminSession, isAdmin } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { ClientLayout } from "./client-layout";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const session = await getAdminSession();
  
  if (!session || !isAdmin(session)) {
    redirect('/signin');
  }

  // Find store with role assignments
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      OR: [
        { userId: session.userId },
        {
          roleAssignments: {
            some: {
              userId: session.userId
            }
          }
        }
      ]
    },
    include: {
      roleAssignments: {
        where: {
          userId: session.userId
        },
        include: {
          role: true
        }
      }
    }
  });

  if (!store) {
    console.log('[LAYOUT] Store not found, checking for any accessible stores...');
    
    // Find any accessible store
    const accessibleStore = await prismadb.store.findFirst({
      where: {
        roleAssignments: {
          some: {
            userId: session.userId
          }
        }
      }
    });

    if (accessibleStore) {
      console.log('[LAYOUT] Redirecting to accessible store:', accessibleStore.id);
      redirect(`/${accessibleStore.id}/overview`);
    }

    console.log('[LAYOUT] No accessible stores found');
    redirect('/');
  }

  // Get all accessible stores (owned and assigned)
  const stores = await prismadb.store.findMany({
    where: {
      OR: [
        { userId: session.userId },
        {
          roleAssignments: {
            some: {
              userId: session.userId
            }
          }
        }
      ]
    },
    include: {
      roleAssignments: {
        where: {
          userId: session.userId
        },
        include: {
          role: true
        }
      }
    }
  });

  return (
    <ClientLayout 
      params={params} 
      store={store} 
      stores={stores}
      isOwner={store.userId === session.userId}
      role={store.roleAssignments?.[0]?.role}
    >
      {children}
    </ClientLayout>
  );
}
