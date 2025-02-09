import { Loader2 } from "lucide-react";

interface SectionLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({
  children,
  loading,
  className = ""
}) => {
  if (!loading) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
};
