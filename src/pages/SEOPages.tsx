import { SEO, SEO_CONFIGS } from '@/components/SEO';
import { generateStructuredData } from '@/lib/structuredData';
import { SEOContent } from '@/components/SEOContent';

export function HomePage() {
  const structuredData = [
    generateStructuredData({ type: 'WebApplication', data: {} }),
    generateStructuredData({ type: 'FAQPage', data: {} }),
  ];
  return (
    <>
      <SEO {...SEO_CONFIGS.home} structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function SchengenCalculatorPage() {
  const structuredData = [
    generateStructuredData({ type: 'WebApplication', data: {} }),
    generateStructuredData({ type: 'FAQPage', data: {} }),
  ];
  return (
    <>
      <SEO {...SEO_CONFIGS.calculator} structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function NinetyDayRulePage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['90-180-rule']} type="article" structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function SchengenVisaCalculatorPage() {
  const structuredData = [generateStructuredData({ type: 'WebApplication', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['schengen-visa-calculator']} structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function HowManyDaysPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['how-many-days-can-i-stay-in-europe']} type="article" structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function WhenCanIReturnPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['when-can-i-return-to-schengen']} type="article" structuredData={structuredData} />
      <SEOContent />
    </>
  );
}

export function USACitizensPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['schengen-calculator-americans']} type="article" structuredData={structuredData} />
      {/* TODO: Add unique content for this page */}
      <SEOContent />
    </>
  );
}

export function UKCitizensPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: {} })];
  return (
    <>
      <SEO {...SEO_CONFIGS['schengen-calculator-uk']} type="article" structuredData={structuredData} />
      {/* TODO: Add unique content for this page */}
      <SEOContent />
    </>
  );
}