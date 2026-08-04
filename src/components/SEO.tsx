import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'application';
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  structuredData?: object | object[];
}

const SEO_DEFAULTS = {
  title: 'Free Schengen 90/180 Day Calculator | Calculate Your Europe Stay',
  description: 'Free Schengen calculator to check your 90/180 day rule. Find out how many days you have left in Europe, when you need to leave, and when you can return. No registration required.',
  keywords: 'Schengen calculator, Schengen 90/180 rule, Europe visa calculator, 90 day rule Europe, Schengen visa calculator, how many days in Europe, EU travel calculator, Schengen days remaining, when can I return to Europe',
  image: 'https://schengen-calculator.com/og-image.jpg',
  imageAlt: 'Schengen 90/180 Day Rule Calculator - Free Europe Travel Tool',
  canonical: 'https://schengen-calculator.com',
};

export function SEO({
  title = SEO_DEFAULTS.title,
  description = SEO_DEFAULTS.description,
  keywords = SEO_DEFAULTS.keywords,
  canonical = SEO_DEFAULTS.canonical,
  type = 'website',
  image = SEO_DEFAULTS.image,
  imageAlt = SEO_DEFAULTS.imageAlt,
  noIndex = false,
  structuredData,
}: SEOProps) {
  const siteName = 'Schengen Calculator';
  const twitterHandle = '@schengen_calc';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0891b2" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}

      {/* Alternate languages (when we add i18n) */}
      {/* <link rel="alternate" hreflang="en" href="https://schengen-calculator.com" />
      <link rel="alternate" hreflang="de" href="https://schengen-calculator.com/de" />
      <link rel="alternate" hreflang="fr" href="https://schengen-calculator.com/fr" />
      <link rel="alternate" hreflang="es" href="https://schengen-calculator.com/es" />
      <link rel="alternate" hreflang="it" href="https://schengen-calculator.com/it" /> */}
    </Helmet>
  );
}

// Pre-defined SEO configurations for different pages
export const SEO_CONFIGS = {
  home: {
    title: 'Free Schengen 90/180 Day Calculator | Calculate Your Europe Stay',
    description: 'Free Schengen calculator to check your 90/180 day rule. Find out how many days you have left in Europe, when you need to leave, and when you can return. No registration required.',
    keywords: 'Schengen calculator, Schengen 90/180 rule, Europe visa calculator, 90 day rule Europe, Schengen visa calculator, how many days in Europe, EU travel calculator, Schengen days remaining, when can I return to Europe',
  },
  
  calculator: {
    title: 'Schengen Calculator - 90/180 Day Rule Calculator | Free Tool',
    description: 'Use our free Schengen calculator to calculate your 90/180 day rule compliance. Plan your Europe trips and avoid visa overstays with our professional tool.',
    keywords: 'Schengen calculator, 90/180 calculator, Europe travel calculator, Schengen visa days, calculate Schengen days, Europe visa calculator',
  },

  '90-180-rule': {
    title: 'Schengen 90/180 Rule Explained | Complete Guide & Calculator',
    description: 'Learn everything about the Schengen 90/180 rule. How it works, how to calculate it, and use our free calculator to check your compliance.',
    keywords: 'Schengen 90/180 rule, 90 180 rule Europe, Schengen rule explained, Europe visa 90 days, rolling 180 days, Schengen calculator',
  },

  'schengen-visa-calculator': {
    title: 'Schengen Visa Calculator | Check Your 90/180 Day Compliance',
    description: 'Free Schengen visa calculator to check your 90/180 day rule compliance. Perfect for visa holders planning Europe travel.',
    keywords: 'Schengen visa calculator, visa 90/180 rule, Europe visa calculator, Schengen visa days, visa compliance calculator',
  },

  'how-many-days-can-i-stay-in-europe': {
    title: 'How Many Days Can I Stay in Europe? | Free Calculator & Guide',
    description: 'Find out exactly how many days you can stay in Europe under the Schengen 90/180 rule. Use our free calculator to check your remaining days.',
    keywords: 'how many days in Europe, Europe stay calculator, Schengen days allowed, 90 days Europe, Europe travel limit, Schengen calculator',
  },

  'when-can-i-return-to-schengen': {
    title: 'When Can I Return to Schengen? | Calculator & Recovery Guide',
    description: 'Calculate when you can return to the Schengen Area after using your 90 days. Our free tool shows your earliest return date.',
    keywords: 'when can I return to Schengen, Schengen return calculator, 90 days recovery, Europe return date, Schengen calculator return',
  },
} as const;

export type SEOPage = keyof typeof SEO_CONFIGS;