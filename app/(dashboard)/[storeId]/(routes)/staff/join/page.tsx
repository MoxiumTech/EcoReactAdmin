import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { JoinForm } from "./components/join-form";

export default async function JoinStaffPage({
  params,
  searchParams,
}: {
  params: { storeId: string };
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    redirect(`/${params.storeId}`);
  }

  // Get invitation details
  const invitation = await prismadb.staffInvitation.findFirst({
    where: {
      token: searchParams.token,
      storeId: params.storeId,
      status: "pending",
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      store: true,
      role: true,
    },
  });

  if (!invitation) {
    redirect(`/${params.storeId}`);
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title={`Join ${invitation.store.name}`}
          description="Accept your invitation to join the staff team"
        />
        <Separator />
        <JoinForm invitation={invitation} />
      </div>
    </div>
  );
}
