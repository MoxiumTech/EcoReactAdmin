import { SecurityForm } from "../components/security-form";
import React from "react";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/auth";

const SecurityPage = async () => {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/signin');
  }

  const user = await prismadb.user.findUnique({
    where: {
      id: session.userId
    },
    select: {
      email: true
    }
  });

  if (!user?.email) {
    redirect('/signin');
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SecurityForm currentEmail={user.email} />
      </div>
    </div>
  );
};

export default SecurityPage;
