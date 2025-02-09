import { verifyAuth, isAdmin, isCustomer } from "@/lib/auth";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketChat } from "@/components/tickets/ticket-chat";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";

const statusColors = {
  OPEN: "bg-yellow-500",
  IN_PROGRESS: "bg-blue-500",
  CLOSED: "bg-green-500",
};

const priorityColors = {
  LOW: "bg-gray-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default async function TicketPage({
  params
}: {
  params: { storeId: string; ticketId: string }
}) {
  const session = await verifyAuth();

  if (!session) {
    redirect(`/${params.storeId}/support`);
  }

  const ticket = await prismadb.supportTicket.findUnique({
    where: {
      id: params.ticketId,
      storeId: params.storeId,
    },
    include: {
      customer: true,
      assignedUser: true,
    }
  });

  if (!ticket) {
    redirect(`/${params.storeId}/support`);
  }

  // Check if user has access to this ticket
  if (isCustomer(session) && ticket.customerId !== session.customerId) {
    redirect(`/${params.storeId}/support`);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${params.storeId}/support`}>
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{ticket.subject}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Ticket ID: {ticket.id}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[ticket.status]}>
                  {ticket.status}
                </Badge>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <TicketChat
            role={isAdmin(session) ? 'admin' : 'customer'}
            ticketId={ticket.id}
            isTicketClosed={ticket.status === 'CLOSED'}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Customer</h3>
                <div className="flex items-center gap-2 mt-1">
                  <UserCircle className="h-4 w-4" />
                  <span>{ticket.customer.name}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {ticket.customer.email}
                </div>
              </div>

              {ticket.assignedUser && (
                <div>
                  <h3 className="text-sm font-medium">Assigned To</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCircle className="h-4 w-4" />
                    <span>{ticket.assignedUser.name}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">Created</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(ticket.createdAt, "MMM d, yyyy HH:mm")}
                </div>
              </div>

              {ticket.closedAt && (
                <div>
                  <h3 className="text-sm font-medium">Closed</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(ticket.closedAt, "MMM d, yyyy HH:mm")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin(session) && ticket.status !== 'CLOSED' && (
            <TicketActions
              storeId={params.storeId}
              ticketId={ticket.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
