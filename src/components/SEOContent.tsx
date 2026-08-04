import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const SCHENGEN_COUNTRIES = [
  'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 
  'Poland', 'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
];

const FAQ_ITEMS = [
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

function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <h3 className="font-medium text-slate-900 dark:text-slate-100 pr-4">
          {question}
        </h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function SEOContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-12 py-12">
      {/* What is Schengen 90/180 Rule Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          What is the Schengen 90/180 Rule?
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            The Schengen 90/180 rule is a visa policy that allows non-EU visitors to stay in the Schengen Area for a maximum of <strong>90 days within any rolling 180-day period</strong>.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Key Points:</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• Maximum 90 days stay allowed</li>
                <li>• Within any rolling 180-day period</li>
                <li>• Entry and exit days both count</li>
                <li>• Applies to all Schengen countries combined</li>
                <li>• For tourism, business, or family visits</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Important Notes:</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• The 180-day window rolls continuously</li>
                <li>• You must count all Schengen countries together</li>
                <li>• Overstaying can result in fines or entry bans</li>
                <li>• Different rules apply for long-stay visas</li>
                <li>• EU citizens are exempt from this rule</li>
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* Schengen Countries Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Which Countries Use the Schengen Rule?
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          The Schengen Area includes {SCHENGEN_COUNTRIES.length} European countries. The 90/180 rule applies to the entire area as a single zone.
        </p>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SCHENGEN_COUNTRIES.map((country) => (
            <div
              key={country}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-center"
            >
              <span className="text-slate-900 dark:text-slate-100 font-medium">{country}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Note:</strong> Some countries like Ireland, Bulgaria, Romania, and Cyprus are EU members but not part of the Schengen Area and have different visa rules.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === index}
              onToggle={() => toggleFaq(index)}
            />
          ))}
        </div>
      </section>




    </div>
  );
}