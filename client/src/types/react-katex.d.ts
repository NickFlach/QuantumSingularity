declare module 'react-katex' {
  import React from 'react';
  
  interface KatexProps {
    children?: string;
    math?: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      macros?: Record<string, string>;
      colorIsTextColor?: boolean;
      strict?: boolean | string;
      trust?: boolean | ((context: { command: string; url: string; protocol: string }) => boolean);
      maxSize?: number;
      maxExpand?: number;
    };
  }
  
  export const InlineMath: React.FC<KatexProps>;
  export const BlockMath: React.FC<KatexProps>;
}