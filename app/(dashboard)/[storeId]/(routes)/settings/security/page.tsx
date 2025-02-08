import { SecurityForm } from "../components/security-form";
import React from "react";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

const SecurityPage = async () => {
  const token = cookies().get('token')?.value;
  const session = await verifyAuth(token || '');
  
  if (!session?.user?.email) {
    redirect('/signin');
  }

  const user = await prismadb.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      email: true
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SecurityForm currentEmail={user?.email || ''} />
      </div>
    </div>
  );
};

export default SecurityPage;