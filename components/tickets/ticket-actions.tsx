"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TicketActionsProps {
  storeId: string;
  ticketId: string;
}

export function TicketActions({ storeId, ticketId }: TicketActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCloseTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${storeId}/support-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to close ticket");
      }

      toast.success("Ticket closed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error("Failed to close ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          className="w-full"
          variant="destructive"
          disabled={loading}
          onClick={handleCloseTicket}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Closing...
            </>
          ) : (
            "Close Ticket"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
