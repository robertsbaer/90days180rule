export function UKCitizensContent() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8 py-12">
      <h1 className='text-4xl font-bold'>Schengen Calculator for UK Travellers</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300">
        Since Brexit, UK citizens are no longer under EU freedom of movement rules. British nationals are now subject to the Schengen 90/180-day rule for short stays. This page explains what that means for your European travel plans.
      </p>

      <section>
        <h2>Post-Brexit Travel Rules for UK Citizens</h2>
        <p>
          As a UK citizen, you can travel to countries in the Schengen Area for up to <strong>90 days in any 180-day period</strong> without a visa for purposes such as tourism or business. This is a significant change from the pre-Brexit era where no such time limits applied.
        </p>
        <p>
          This 90-day limit is cumulative and applies to the entire Schengen zone. It is essential to track your travel days to avoid accidentally overstaying.
        </p>
      </section>

      <section>
        <h2>How Our Calculator Helps UK Travellers</h2>
        <ul>
          <li><strong>Track Your Allowance:</strong> Enter your past and future trip dates to see exactly how many of your 90 days you have used.</li>
          <li><strong>Plan Future Trips:</strong> Experiment with different travel dates to see how they affect your remaining allowance, ensuring your holiday plans are compliant.</li>
          <li><strong>Avoid Overstay Penalties:</strong> Get a clear picture of your legal stay period to avoid fines or potential entry bans.</li>
          <li><strong>Understand Your Rolling Window:</strong> The calculator automatically handles the complexity of the 180-day rolling window, so you don't have to count days manually.</li>
        </ul>
      </section>

      <section>
        <h2>Frequently Asked Questions for UK Citizens</h2>
        <h3>Do I need a visa to travel to the Schengen Area from the UK?</h3>
        <p>For short stays (up to 90 days in any 180-day period), you do not need a visa. For longer stays, or for work, study, or other purposes, you may need to apply for a national visa from the specific country you plan to visit.</p>

        <h3>Does time spent in Ireland count towards my Schengen 90 days?</h3>
        <p>No. Ireland is not part of the Schengen Area. It has its own entry requirements, and time spent there does not count towards your 90-day Schengen allowance.</p>

        <h3>What is the ETIAS and when will it affect me?</h3>
        <p>The European Travel Information and Authorisation System (ETIAS) is a new electronic travel authorisation for visa-exempt visitors. It is expected to be implemented in mid-2025. Once it is, UK citizens will need to apply for an ETIAS online before travelling to the Schengen Area. It will be valid for three years.</p>
      </section>

      <section>
        <h2>Plan Your European Travel with Confidence</h2>
        <p>
          The rules may have changed, but travelling to Europe from the UK is still straightforward with a bit of planning. Use our <a href="/">free Schengen calculator</a> to take the guesswork out of the 90/180-day rule and enjoy your trips with peace of mind.
        </p>
      </section>
    </div>
  );
}