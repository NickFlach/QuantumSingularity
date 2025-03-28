import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  language?: string;
}

export const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, language, children, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "rounded-md bg-muted p-4 overflow-x-auto text-sm font-mono",
          language && `language-${language}`,
          className
        )}
        {...props}
      >
        <code className={cn(language && `language-${language}`)}>{children}</code>
      </pre>
    );
  }
);

Code.displayName = "Code";