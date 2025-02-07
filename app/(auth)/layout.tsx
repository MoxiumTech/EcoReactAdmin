import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientAuthLayout } from "./client-layout";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAuth();

  // If already logged in, redirect to dashboard
  if (session) {
    return redirect('/');
  }

  return <ClientAuthLayout>{children}</ClientAuthLayout>;
}
