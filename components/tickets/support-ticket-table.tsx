"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupportTicket, TicketStatus } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface SupportTicketTableProps {
  role: 'admin' | 'customer';
}

type ExtendedSupportTicket = SupportTicket & {
  customer: {
    name: string;
    email: string;
  };
  assignedUser?: {
    name: string;
  };
  messages: {
    createdAt: Date;
  }[];
};

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

export function SupportTicketTable({ role }: SupportTicketTableProps) {
  const router = useRouter();
  const params = useParams();
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");

  const fetchTickets = async () => {
    try {
      const url = new URL(`/api/${params.storeId}/support-tickets`, window.location.origin);
      if (statusFilter !== "ALL") {
        url.searchParams.append("status", statusFilter);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadTickets = async () => {
      try {
        await fetchTickets();
      } catch (error) {
        if (mounted) {
          console.error("Error loading tickets:", error);
        }
      }
    };

    loadTickets();

    return () => {
      mounted = false;
    };
  }, [statusFilter, params.storeId]);


  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await fetch(`/api/${params.storeId}/support-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleRowClick = (ticketId: string) => {
    router.push(`/${params.storeId}/support/${ticketId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select
          value={statusFilter}
          onValueChange={(value: TicketStatus | "ALL") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tickets</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            {role === 'admin' && <TableHead>Customer</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleRowClick(ticket.id)}
            >
              <TableCell>{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              {role === 'admin' && (
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.customer.name}</span>
                    <span className="text-sm text-gray-500">{ticket.customer.email}</span>
                  </div>
                </TableCell>
              )}
              <TableCell>
                {role === 'admin' ? (
                  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Select
                      value={ticket.status}
                      onValueChange={(value: TicketStatus) => handleStatusChange(ticket.id, value)}
                    >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.assignedUser?.name || "Unassigned"}
              </TableCell>
              <TableCell>
                {ticket.messages.length > 0
                  ? format(new Date(ticket.messages[0].createdAt), "MMM d, yyyy HH:mm")
                  : "No messages"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(ticket.id);
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
