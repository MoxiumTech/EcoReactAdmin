import { verifyAuth, isAdmin, isCustomer } from "@/lib/auth";
import { SupportTicketTable } from "@/components/tickets/support-ticket-table";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Heading } from "@/components/ui/heading";

export default async function SupportPage({
  params
}: {
  params: { storeId: string }
}) {
  const session = await verifyAuth();
  if (!session) return null;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Support Tickets"
          description={isAdmin(session) ? "Manage customer support tickets" : "Get help from our support team"}
        />
        
        {isCustomer(session) && (
          <Button
            onClick={() => window.location.href = `/${params.storeId}/support/new`}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin(session) ? "All Support Tickets" : "Your Support Tickets"}
          </CardTitle>
          <CardDescription>
            {isAdmin(session)
              ? "View and manage all customer support tickets"
              : "View and manage your support tickets"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportTicketTable 
            role={isAdmin(session) ? 'admin' : 'customer'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
