import { ReactNode, useEffect } from 'react';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  useEffect(() => {
    // XSS Protection: Override dangerous functions in development
    if (import.meta.env.DEV) {
      const originalEval = window.eval;
      window.eval = function() {
        console.warn('eval() is disabled for security reasons');
        return undefined;
      } as typeof originalEval;
    }

    // Content Security Policy headers should be set server-side
    // This is just a client-side reminder
  }, []);

    return <>{children}</>;
};

