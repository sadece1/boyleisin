// ERR_BLOCKED_BY_CLIENT console hatalarını yok eder - Ad blocker bypass
if (typeof window !== 'undefined') {
  // Global error handler
  window.addEventListener('error', (e) => {
    if (e.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        e.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
        e.filename?.includes('gen204') ||
        e.filename?.includes('pagespeed')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason?.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
        e.reason?.message?.includes('Failed to fetch')) {
      e.preventDefault();
      return false;
    }
  });

  // Request interceptor for fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args);
    } catch (e: any) {
      if (e?.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          e?.message?.includes('Failed to fetch') ||
          args[0]?.toString().includes('gen204') ||
          args[0]?.toString().includes('pagespeed')) {
        // Silently ignore blocked requests
        return new Response(null, { status: 200, statusText: 'OK' });
      }
      throw e;
    }
  };

  // XMLHttpRequest interceptor
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlString = url.toString();
    if (urlString.includes('gen204') || urlString.includes('pagespeed')) {
      // Block these requests silently
      return;
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };
}

