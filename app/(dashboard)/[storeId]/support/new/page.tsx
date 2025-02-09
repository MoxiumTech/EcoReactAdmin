import { verifyAuth, isCustomer } from "@/lib/auth";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";
import { Heading } from "@/components/ui/heading";
import { redirect } from "next/navigation";

export default async function NewTicketPage({
  params
}: {
  params: { storeId: string }
}) {
  const session = await verifyAuth();

  if (!session || !isCustomer(session)) {
    redirect(`/${params.storeId}/support`);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading 
        title="Create Support Ticket"
        description="Submit a new support request"
      />
      
      <div className="mt-8">
        <CreateTicketForm />
      </div>
    </div>
  );
}
