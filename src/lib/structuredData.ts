export interface StructuredDataProps {
  type: 'WebApplication' | 'FAQPage' | 'Organization' | 'Article' | 'HowTo';
  data: Record<string, any>;
}

export function generateStructuredData({ type, data }: StructuredDataProps) {
  const baseSchemas: Record<string, object> = {
    SoftwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Schengen 90/180 Day Calculator',
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
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
          name: 'How does the Schengen calculator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You enter your past and planned travel dates, and the calculator determines if your trips comply with the 90/180 rule. It shows your remaining days and flags any potential overstays.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do arrival and departure days count?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Both the day you enter the Schengen Area and the day you leave count as full days within your 90-day allowance.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I reset my Schengen 90 days?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, the 90-day allowance does not \'reset\' in a simple way. It operates on a rolling 180-day basis. To regain days, you must wait for old travel days to expire from this 180-day window.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many days can Americans stay in Europe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'U.S. citizens can stay in the Schengen Area for up to 90 days within any 180-day period for tourism or business without a visa.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many days can UK citizens stay in Schengen?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Following Brexit, UK citizens can also stay in the Schengen Area for up to 90 days in any 180-day period without a visa.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does leaving Schengen reset the 90 days?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Leaving the Schengen Area does not reset the 180-day clock or your 90-day allowance. The calculation is always based on the past 180 days from any given date.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this an official EU calculator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, this is an independent, free tool designed to help travelers understand and apply the 90/180 rule. It is not affiliated with the European Union.',
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
    question: 'How does the Schengen calculator work?',
    answer: 'You enter your past and planned travel dates, and the calculator determines if your trips comply with the 90/180 rule. It shows your remaining days and flags any potential overstays.',
  },
  {
    question: 'Do arrival and departure days count?',
    answer: 'Yes. Both the day you enter the Schengen Area and the day you leave count as full days within your 90-day allowance.',
  },
  {
    question: 'Can I reset my Schengen 90 days?',
    answer: 'No, the 90-day allowance does not \'reset\' in a simple way. It operates on a rolling 180-day basis. To regain days, you must wait for old travel days to expire from this 180-day window.',
  },
  {
    question: 'How many days can Americans stay in Europe?',
    answer: 'U.S. citizens can stay in the Schengen Area for up to 90 days within any 180-day period for tourism or business without a visa.',
  },
  {
    question: 'How many days can UK citizens stay in Schengen?',
    answer: 'Following Brexit, UK citizens can also stay in the Schengen Area for up to 90 days in any 180-day period without a visa.',
  },
  {
    question: 'Does leaving Schengen reset the 90 days?',
    answer: 'No. Leaving the Schengen Area does not reset the 180-day clock or your 90-day allowance. The calculation is always based on the past 180 days from any given date.',
  },
  {
    question: 'Is this an official EU calculator?',
    answer: 'No, this is an independent, free tool designed to help travelers understand and apply the 90/180 rule. It is not affiliated with the European Union.',
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