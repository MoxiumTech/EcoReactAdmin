import { redirect } from "next/navigation";
import { getAdminSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export default async function AdminRoot() {
  const session = await getAdminSession();

  // If no admin session, redirect to sign in
  if (!session || !isAdmin(session)) {
    redirect('/signin');
  }

  // Get the admin's first store
  const store = await prismadb.store.findFirst({
    where: {
      userId: session.userId
    }
  });

  // If no store exists, redirect to store creation
  if (!store) {
    redirect('/new');
    return null;
  }

  // Redirect to the store's dashboard
  redirect(`/${store.id}`);
  return null;
}
