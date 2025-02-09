import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <div className={cn("animate-spin", className)} {...props}>
      <Loader status="Loading your content..."/>
    </div>
  );
}