"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionLoading } from "./section-loading";
import { ErrorState } from "./error-state";
import { useTimeline } from "@/hooks/use-timeline";

interface TimelineProps {
  orderId: string;
  pollingInterval?: number;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  orderId,
  pollingInterval 
}) => {
  const params = useParams();
  const { events, loading, error, refresh } = useTimeline({
    orderId,
    storeId: params.storeId as string,
    pollingInterval
  });

  if (error) {
    return (
      <ErrorState
        title="Timeline Unavailable"
        description={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <SectionLoading loading={loading}>
      <div className="flow-root">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No timeline events found
          </div>
        ) : (
          <ul role="list" className="-mb-8">
            {events.map((event, eventIdx) => {
              const Icon = event.icon || AlertCircle;
              return (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== events.length - 1 && (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                          {
                            'bg-green-500': event.type === 'status_change',
                            'bg-blue-500': event.type === 'stock_movement',
                            'bg-yellow-500': event.type === 'payment'
                          }
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                  {event.description && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {event.description}
                    </p>
                  )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {format(new Date(event.date), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionLoading>
  );
};
