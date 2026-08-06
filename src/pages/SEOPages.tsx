import { SEO, SEO_CONFIGS } from '@/components/SEO';
import { generateStructuredData } from '@/lib/structuredData';
import { SEOContent } from '@/components/SEOContent';

import { NinetyDayRuleContent } from '@/components/content/NinetyDayRuleContent';

import { USACitizensContent } from '@/components/content/USACitizensContent';
import { UKCitizensContent } from '@/components/content/UKCitizensContent';
import { CountDaysContent } from '@/components/content/CountDaysContent';
import { OverstayRulesContent } from '@/components/content/OverstayRulesContent';

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
  const structuredData = [generateStructuredData({ type: 'Article', data: { headline: "The Schengen 90/180-Day Rule Explained" } })];
  return (
    <>
      <SEO {...SEO_CONFIGS['90-180-rule']} type="article" structuredData={structuredData} />
      <NinetyDayRuleContent />
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
  const structuredData = [generateStructuredData({ type: 'Article', data: { headline: "Schengen Calculator for Americans" } })];
  return (
    <>
      <SEO {...SEO_CONFIGS['schengen-calculator-americans']} type="article" structuredData={structuredData} />
      <USACitizensContent />
    </>
  );
}

export function UKCitizensPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: { headline: "Schengen Calculator for UK Travellers" } })];
  return (
    <>
      <SEO {...SEO_CONFIGS['schengen-calculator-uk']} type="article" structuredData={structuredData} />
      <UKCitizensContent />
    </>
  );
}

export function CountDaysPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: { headline: "How to Count Schengen Days" } })];
  return (
    <>
      <SEO title="How to Count Schengen Days Correctly | 90/180 Rule" description="Learn the official method for counting your Schengen days to stay compliant with the 90/180 rule, including how arrival and departure days are treated." type="article" structuredData={structuredData} />
      <CountDaysContent />
    </>
  );
}

export function OverstayRulesPage() {
  const structuredData = [generateStructuredData({ type: 'Article', data: { headline: "Schengen Overstay Rules and Consequences" } })];
  return (
    <>
      <SEO title="Schengen Overstay Rules & Consequences | What Happens If You Overstay" description="Understand the serious consequences of overstaying your 90-day allowance in the Schengen Area, including fines, bans, and future visa implications." type="article" structuredData={structuredData} />
      <OverstayRulesContent />
    </>
  );
}