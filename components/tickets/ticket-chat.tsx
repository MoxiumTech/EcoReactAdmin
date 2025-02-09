"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  message: string;
  senderId: string;
  senderType: "CUSTOMER" | "STAFF";
  createdAt: string;
}

interface TicketChatProps {
  role: 'admin' | 'customer';
  ticketId: string;
  isTicketClosed?: boolean;
}

export function TicketChat({ role, ticketId, isTicketClosed }: TicketChatProps) {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Define fetchMessages with proper dependencies
  // Set up polling for new messages
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [params.storeId, ticketId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/${params.storeId}/support-tickets/${ticketId}/messages`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || isTicketClosed) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/${params.storeId}/support-tickets/${ticketId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage.trim() }),
        }
      );

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === (role === 'admin' ? 'STAFF' : 'CUSTOMER')
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.senderType === (role === 'admin' ? 'STAFF' : 'CUSTOMER')
                    ? "bg-blue-100"
                    : "bg-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                <div
                  className={`text-xs mt-2 text-gray-500 ${
                    message.senderType === (role === 'admin' ? 'STAFF' : 'CUSTOMER')
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {format(new Date(message.createdAt), "MMM d, HH:mm")}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isTicketClosed
                ? "This ticket is closed"
                : "Type your message here..."
            }
            disabled={isTicketClosed}
            className="resize-none"
            rows={2}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending || isTicketClosed}
            className="self-end"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
