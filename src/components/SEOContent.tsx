import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { SCHENGEN_FAQ_DATA } from '@/lib/structuredData';

const FAQ_ITEMS: { question: string, answer: string }[] = SCHENGEN_FAQ_DATA;

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
      {/* Intro Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Free Schengen 90/180 Day Calculator
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
          Find out exactly how many days you can stay in the Schengen Area. Our free 90/180 calculator tracks your previous trips, calculates remaining days, and helps you avoid accidentally overstaying your visa-free allowance.
        </p>
      </section>

      {/* How the Rule Works Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          How the Schengen 90/180 Rule Works
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            The rule states you can stay a maximum of <strong>90 days</strong> within any <strong>rolling 180-day period</strong>. It is not tied to a calendar year. All Schengen countries share this allowance, and both your entry and exit days count.
          </p>
        </div>
      </section>

      {/* How To Use Section */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          How To Use This Schengen Calculator
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg p-6 border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-2">Step 1</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Enter Previous Trips</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Add your past trips to any Schengen country.</p>
          </div>
          <div className="rounded-lg p-6 border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-2">Step 2</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Add Future Plans</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Add any future trips you are planning to take.</p>
          </div>
          <div className="rounded-lg p-6 border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-2">Step 3</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Review Remaining Days</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Instantly see your remaining days and compliance status.</p>
          </div>
        </div>
      </section>

      {/* Why Use Our Calculator Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Why Use Our Calculator?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">100% Free</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">This tool is completely free to use.</p>
          </div>
          <div className="text-center p-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">No Account Required</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">No registration or sign-up needed.</p>
          </div>
          <div className="text-center p-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Easy Travel Planning</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Plan your future trips with confidence.</p>
          </div>
          <div className="text-center p-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Mobile Friendly</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Works perfectly on desktop and mobile.</p>
          </div>
          <div className="text-center p-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Avoid Overstays</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Prevent accidental and costly overstays.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {SCHENGEN_FAQ_DATA.map((faq, index) => (
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