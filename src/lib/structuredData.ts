export interface StructuredDataProps {
  type: 'WebApplication' | 'FAQPage' | 'Organization' | 'Article' | 'HowTo';
  data: Record<string, any>;
}

export function generateStructuredData({ type, data }: StructuredDataProps) {
  const baseSchemas: Record<string, object> = {
    WebApplication: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Schengen Calculator',
      description: 'A free calculator that helps travelers understand the Schengen 90/180-day rule and plan their Europe trips compliantly.',
      url: 'https://90days180rule.com',
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Organization',
        name: 'Schengen Calculator',
        url: 'https://90days180rule.com',
      },
      featureList: [
        '90/180 day rule calculation',
        'Trip planning and validation',
        'Visual calendar with compliance status',
        'Multi-trip planning',
        'Day-by-day breakdown',
        'Recovery timeline calculation',
      ],
    },

    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Schengen Calculator',
      url: 'https://90days180rule.com',
      description: 'Free Schengen 90/180 day rule calculator for European travelers',
      logo: 'https://90days180rule.com/logo.png',
      sameAs: [
        'https://twitter.com/schengen_calc',
        'https://facebook.com/90days180rule',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@90days180rule.com',
        availableLanguage: ['English', 'German', 'French', 'Spanish', 'Italian'],
      },
    },

    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the Schengen 90/180 rule?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Schengen 90/180 rule allows non-EU visitors to stay in the Schengen Area for a maximum of 90 days within any rolling 180-day period. This rule applies to short-stay visits for tourism, business, or family visits.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many days can I stay in Europe without a visa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most non-EU citizens can stay in the Schengen Area for up to 90 days within any 180-day period without a visa. This applies to all Schengen countries combined, not 90 days per country.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the Schengen calculator count arrival and departure days?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, both your arrival day and departure day count toward your 90-day limit, even if you only spend part of those days in the Schengen Area.',
          },
        },
        {
          '@type': 'Question',
          name: 'When can I return to Europe after using my 90 days?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can return to the Schengen Area when enough days have expired from your previous visits so that you no longer exceed 90 days in the rolling 180-day window. Our calculator shows your exact return date.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this Schengen calculator free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our Schengen calculator is completely free to use with no registration required. We provide this tool to help travelers understand and comply with Schengen visa rules.',
          },
        },
      ],
    },

    HowTo: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Use the Schengen Calculator',
      description: 'Step-by-step guide to using the Schengen 90/180 day calculator',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Enter Your Previous Trips',
          text: 'Add all your previous trips to the Schengen Area, including entry and exit dates.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Check Your Current Status',
          text: 'Review your current compliance status and see how many days you have remaining.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Plan Future Trips',
          text: 'Use the planner to add future trips and check if they comply with the 90/180 rule.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Monitor Your Days',
          text: 'Regularly update your travel history and check your remaining days before each trip.',
        },
      ],
    },
    
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      author: {
        '@type': 'Organization',
        name: 'Schengen Calculator',
        url: 'https://90days180rule.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Schengen Calculator',
        logo: {
          '@type': 'ImageObject',
          url: 'https://90days180rule.com/logo.png',
        },
      },
    },
  };

  // Merge base schema with provided data
  const baseSchema = baseSchemas[type] || {};
  return { ...baseSchema, ...data };
}

// Specific FAQ data for Schengen calculator
export const SCHENGEN_FAQ_DATA = [
  {
    question: 'What is the Schengen 90/180 rule?',
    answer: 'The Schengen 90/180 rule allows non-EU visitors to stay in the Schengen Area for a maximum of 90 days within any rolling 180-day period. This rule applies to short-stay visits for tourism, business, or family visits.',
  },
  {
    question: 'How many days can I stay in Europe without a visa?',
    answer: 'Most non-EU citizens can stay in the Schengen Area for up to 90 days within any 180-day period without a visa. This applies to all Schengen countries combined, not 90 days per country.',
  },
  {
    question: 'Does the Schengen calculator count arrival and departure days?',
    answer: 'Yes, both your arrival day and departure day count toward your 90-day limit, even if you only spend part of those days in the Schengen Area.',
  },
  {
    question: 'Can I stay 90 days, leave, and return immediately?',
    answer: 'No, you cannot simply leave for a day and return. The 90/180 rule is based on a rolling 180-day window. You need to wait until enough days expire from your previous visits before returning.',
  },
  {
    question: 'How do I calculate my remaining Schengen days?',
    answer: 'Use our free Schengen calculator by entering your previous trips. It automatically calculates how many days you have remaining in your current 180-day period and shows when you can return.',
  },
  {
    question: 'When can I return to Europe after using my 90 days?',
    answer: 'You can return when enough days have expired from your previous visits so you no longer exceed 90 days in the rolling 180-day window. Our calculator shows your exact return date.',
  },
  {
    question: 'Does this calculator work for all Schengen countries?',
    answer: 'Yes, our calculator works for all Schengen Area countries including France, Spain, Italy, Germany, Netherlands, Switzerland, Norway, and many others.',
  },
  {
    question: 'Is this Schengen calculator free?',
    answer: 'Yes, our Schengen calculator is completely free to use with no registration required. We provide this tool to help travelers understand and comply with Schengen visa rules.',
  },
  {
    question: 'Do EU citizens need this calculator?',
    answer: 'No, EU citizens and citizens of Schengen countries can travel freely within the Schengen Area without time limits. This calculator is for non-EU visitors subject to the 90/180 rule.',
  },
  {
    question: 'Does a long-stay visa follow the 90/180 rule?',
    answer: 'No, long-stay visas (over 90 days) and residence permits are not subject to the 90/180 rule. This rule only applies to short-stay visits without a visa or with a short-stay visa.',
  },
];

// List of all Schengen countries for structured data
export const SCHENGEN_COUNTRIES = [
  'Austria',
  'Belgium',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
];