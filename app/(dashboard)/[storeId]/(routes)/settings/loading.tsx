"use client";

import { Loader } from "@/components/ui/loader";

const Loading = () => {
  return ( 
    <div className="flex h-full w-full items-center justify-center">
      <Loader 
        simulateProgress={true}
        status="Loading your Settings..."
      />
    </div>
   );
}
 
export default Loading;