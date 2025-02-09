"use client";

import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";

interface OrderTimelineProps {
  events: TimelineEvent[];
  className?: string;
}


interface OrderTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const OrderTimeline = ({ events, className }: OrderTimelineProps) => {
  if (!events) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center py-4 text-muted-foreground">
          Timeline unavailable
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
        <div className="text-center py-4 text-muted-foreground">
          No timeline events found
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
      <div className="relative">
        {/* Line running through timeline */}
        <div className="absolute left-3.5 top-0 h-full w-px bg-border" />

        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>

              <div className="flex-1 ml-8 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.date), 'MMM d, yyyy h:mm a')}</span>
                </div>
              <h3 className="font-medium">{event.title}</h3>
              {event.description && (
                <p className="text-sm text-muted-foreground break-words">
                  {event.description}
                </p>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
