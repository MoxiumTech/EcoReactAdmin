
import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader 
        simulateProgress={true}
        status="Loading your Taxons..."
      />
    </div>
  );
}