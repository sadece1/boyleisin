import { Helmet } from 'react-helmet-async';
import { config } from '@/config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  author?: string;
  publishTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
}

export const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  structuredData,
  canonicalUrl,
  noindex = false,
  nofollow = false,
  author,
  publishTime,
  modifiedTime,
  locale = 'tr_TR',
  alternateLocales = []
}: SEOProps) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageTitle = title ? `${title} | ${config.appName}` : config.appName;
  const pageDescription = description || config.appDescription;
  const pageImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-image.jpg`;
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonical = canonicalUrl || pageUrl;
  
  // Robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content={author || config.appName} />
      {publishTime && <meta name="pubdate" content={publishTime} />}
      {modifiedTime && <meta name="lastmod" content={modifiedTime} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Alternate Languages */}
      {alternateLocales.map(loc => (
        <link key={loc} rel="alternate" hrefLang={loc} href={`${baseUrl}${url || ''}`} />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || config.appName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={config.appName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={title || config.appName} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

