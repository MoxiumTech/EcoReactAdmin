"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, ArrowLeft, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  message: string;
  senderType: "CUSTOMER" | "STAFF";
  createdAt: Date;
}

interface Ticket {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  messages: Message[];
}

interface StorefrontChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  customerId: string;
}

export const StorefrontChatDialog = ({
  isOpen,
  onClose,
  storeId,
  customerId
}: StorefrontChatDialogProps) => {
  const [step, setStep] = useState<"select" | "new" | "chat">("select");
  const [subject, setSubject] = useState("");
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [existingTickets, setExistingTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing tickets when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `/api/storefront/${storeId}/support?customerId=${customerId}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch tickets");
        
        const tickets = await response.json();
        setExistingTickets(tickets);
        
        // If there's an active ticket, set it and go to chat
        const activeTicket = tickets.find(
          (t: Ticket) => t.status === "OPEN" || t.status === "IN_PROGRESS"
        );
        if (activeTicket) {
          setActiveTicket(activeTicket);
          setTicketId(activeTicket.id);
          setStep("chat");
        } else {
          setStep("select");
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [isOpen, storeId, customerId]);

  // Poll for new messages when in chat
  useEffect(() => {
    if (step !== "chat" || !ticketId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/storefront/${storeId}/support/${ticketId}/messages?customerId=${customerId}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch messages");
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [storeId, ticketId, customerId, step]);

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/storefront/${storeId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          customerId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create support ticket");
      }

      const ticket = await response.json();
      setTicketId(ticket.id);
      setActiveTicket(ticket);
      setStep("chat");
    } catch (err) {
      setError("Failed to start chat. Please try again.");
      console.error("Error starting chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketId || !customerId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/storefront/${storeId}/support/${ticketId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: newMessage,
            customerId
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      // Don't clear message input on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
        <div 
          className={cn(
            "px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "flex items-center gap-3"
          )}
        >
          {step !== "select" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setStep("select")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="font-semibold">
              {step === "select" ? "Support" : 
               step === "new" ? "Start a conversation" : 
               activeTicket?.subject || "Chat with us"}
            </h2>
            {step === "chat" && (
              <p className="text-xs text-muted-foreground">
                {activeTicket?.status === "IN_PROGRESS" ? "Staff is responding" : "Waiting for staff"}
              </p>
            )}
          </div>
          {step === "chat" && activeTicket?.status === "IN_PROGRESS" && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {step === "select" && (
            <div className="space-y-4">
              {existingTickets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Recent Conversations</h3>
                  {existingTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={cn(
                        "p-4 border rounded-lg space-y-2 transition-colors",
                        ticket.status !== "CLOSED" && "hover:border-primary cursor-pointer",
                        ticket.status === "CLOSED" && "opacity-75"
                      )}
                      onClick={() => {
                        if (ticket.status !== "CLOSED") {
                          setTicketId(ticket.id);
                          setActiveTicket(ticket);
                          setStep("chat");
                        }
                      }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          {ticket.messages.length > 0 && (
                            <p className="text-sm text-muted-foreground truncate">
                              {ticket.messages[ticket.messages.length - 1].message}
                            </p>
                          )}
                        </div>
                        <span 
                          className={cn(
                            "px-2 py-1 rounded-full text-xs whitespace-nowrap",
                            ticket.status === "CLOSED" ? "bg-gray-100" :
                            ticket.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"
                          )}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                      {ticket.status !== "CLOSED" && (
                        <p className="text-xs text-muted-foreground">
                          Click to continue conversation
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!existingTickets.find(t => t.status !== "CLOSED") && (
                <Button
                  onClick={() => setStep("new")}
                  className="w-full"
                >
                  Start New Chat
                </Button>
              )}
            </div>
          )}

          {step === "new" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                How can we help you today?
              </p>
              <form onSubmit={handleStartNewChat} className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Starting..." : "Start Chat"}
                </Button>
              </form>
            </div>
          )}

          {step === "chat" && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.senderType === "CUSTOMER" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    {message.senderType === "STAFF" ? (
                      <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground">
                        <UserCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">You</span>
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "flex flex-col max-w-[75%] gap-1",
                    message.senderType === "CUSTOMER" ? "items-end" : "items-start"
                  )}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2",
                        message.senderType === "CUSTOMER"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      )}
                    >
                      {message.message}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No messages yet. Start the conversation!
                </p>
              )}
            </div>
          )}
        </div>

        {step === "chat" && (
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/50">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[80px] max-h-[160px] resize-none bg-background"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10"
                disabled={isLoading || !newMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
