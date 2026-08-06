import { ExternalLink } from 'lucide-react';

export function NinetyDayRuleContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
        The Schengen 90/180-Day Rule Explained
      </h1>

      <p className="text-lg text-slate-700 dark:text-slate-300">
        The Schengen 90/180-day rule is a fundamental policy for non-EU/EEA citizens visiting the Schengen Area for short stays. Understanding it is crucial to avoid overstays and potential penalties. This guide breaks down exactly how it works.
      </p>

      <section>
        <h2>What is the Schengen Area?</h2>
        <p>
          The Schengen Area is a zone of 27 European countries that have officially abolished all passport and other types of border control at their mutual borders. For travel purposes, this zone acts as a single country. An entry into one Schengen country is an entry into the entire area.
        </p>
      </section>

      <section>
        <h2>The Core Principle: 90 Days in a Rolling 180-Day Period</h2>
        <p>
          The rule states that a non-EU/EEA national can stay in the Schengen Area for a maximum of <strong>90 days within any rolling 180-day period</strong>. This is the most misunderstood part of the policy.
        </p>
        <ul>
          <li><strong>It is not 90 days per country.</strong> The 90-day limit is for the entire Schengen block combined.</li>
          <li><strong>It is not based on a calendar year.</strong> The 180-day window is not fixed (e.g., January 1st to June 30th). It is a moving timeframe.</li>
          <li><strong>The 180-day window looks backwards.</strong> To determine your compliance on any given day (including today), you must look back at the previous 180 days and count the number of days you spent in the Schengen Area during that period.</li>
        </ul>
      </section>

      <section>
        <h2>How to Count Your Days Correctly</h2>
        <p>Correctly counting your days is essential. The official rule, as implemented by our <a href="/">Schengen Calculator</a>, includes:</p>
        <ul>
          <li><strong>Day of Arrival:</strong> The day you enter the Schengen Area counts as a full day, even if you arrive at 11:59 PM.</li>
          <li><strong>Day of Departure:</strong> The day you exit the Schengen Area also counts as a full day, even if you depart at 12:01 AM.</li>
          <li><strong>Every Day In-Between:</strong> Every day spent within the zone, including weekends and holidays, counts towards your 90-day limit.</li>
        </ul>
        <p>
          For example, a trip where you arrive on a Monday and leave on the following Friday counts as 5 days.
        </p>
      </section>

      <section>
        <h2>A Practical Example</h2>
        <p>
          Imagine today is <strong>June 30th</strong>. To check if you are compliant, you must count all the days you were inside the Schengen Area in the 180-day period from <strong>January 2nd to June 30th</strong>. If that total is 90 days or less, you are compliant. If it is 91 days or more, you are in an overstay situation.
        </p>
        <p>
          Our calculator automates this look-back process for any date you choose, making it easy to verify your status and plan future travel.
        </p>
      </section>

      <section>
        <h2>Overstays and Consequences</h2>
        <p>
          Overstaying your 90-day allowance is a serious matter. Potential consequences include:
        </p>
        <ul>
          <li>Fines</li>
          <li>Immediate deportation</li>
          <li>An entry ban for the entire Schengen Area for a period of time (e.g., 1-3 years)</li>
          <li>Difficulties in obtaining future visas for Schengen or other countries</li>
        </ul>
        <p>
          It is never advisable to overstay. Always plan your trips carefully using a reliable tool. Check our guide on <a href="/schengen-overstay-rules">Schengen overstay rules</a> for more details.
        </p>
      </section>

      <section>
        <h2>Who Does the 90/180 Rule Apply To?</h2>
        <p>
          This rule applies to non-EU/EEA/Swiss citizens who do not require a visa for short stays. This includes, for example, citizens of:
        </p>
        <ul>
          <li>The United States (see our <a href="/schengen-calculator-americans">Schengen calculator for Americans</a>)</li>
          <li>The United Kingdom (see our <a href="/schengen-calculator-uk">Schengen calculator for UK citizens</a>)</li>
          <li>Canada</li>
          <li>Australia</li>
          <li>New Zealand</li>
          <li>And many others.</li>
        </ul>
        <p>It does not apply to those holding a long-stay visa or a residence permit for a Schengen country. Those individuals are governed by the rules of their specific visa or permit.</p>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
          <p>For more detailed answers, visit our main FAQ section.</p>
          <ul>
            <li><strong>Can I reset the 90 days by leaving for a day?</strong> No. Leaving does not reset the clock. You must wait for days to expire from the 180-day look-back period.</li>
            <li><strong>Is there a way to stay longer than 90 days?</strong> The only legal way is to obtain a national long-stay visa (Type D) from a specific Schengen country before you travel.</li>
          </ul>
      </section>

    </div>
  );
}