import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 max-w-7xl",
        className
      )}
      {...props}
    />
  );
}