import type { Plugin } from 'vite';

/**
 * Vite plugin to make CSS loading non-blocking
 * Converts render-blocking CSS to async loading using media="print" trick
 */
export function cssAsync(): Plugin {
  return {
    name: 'css-async',
    enforce: 'post',
    transformIndexHtml: {
      enforce: 'post',
      transform(html, ctx) {
        // Only transform in production build
        if (ctx.server) {
          return html;
        }
        
        // Find all CSS link tags and make them async
        return html.replace(
          /<link([^>]*rel=["']stylesheet["'][^>]*)>/gi,
          (match) => {
            // Skip if already has media or onload
            if (match.includes('media=') || match.includes('onload=')) {
              return match;
            }
            
            // Convert to preload with async loading using media="print" trick
            const linkMatch = match.match(/<link([^>]*)>/);
            if (!linkMatch) return match;
            
            const attrs = linkMatch[1];
            const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
            if (!hrefMatch) return match;
            
            const href = hrefMatch[1];
            const otherAttrs = attrs.replace(/href=["'][^"']+["']/, '').trim();
            
            // Create preload link and async stylesheet
            // media="print" prevents render blocking, onload switches to "all"
            return `
            <link rel="preload" as="style" href="${href}" ${otherAttrs}>
            <link rel="stylesheet" href="${href}" ${otherAttrs} media="print" onload="this.media='all'">
            <noscript><link rel="stylesheet" href="${href}" ${otherAttrs}></noscript>
          `.trim();
          }
        );
      },
    },
  };
}

