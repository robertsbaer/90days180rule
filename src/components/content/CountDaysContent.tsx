export function CountDaysContent() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8 py-12">
      <h1 className='text-4xl font-bold'>How to Count Schengen Days Correctly</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300">
        The most common point of confusion with the 90/180-day rule is how to count the days. The official method is strict and unforgiving. This guide provides a clear, step-by-step process.
      </p>

      <section>
        <h2>The Two Most Important Rules of Counting</h2>
        <ol>
          <li><strong>The Day of Arrival is Day 1:</strong> Your entry day counts as a full day of stay, regardless of what time you arrive. If your flight lands at 11:55 PM on a Monday, that Monday is counted as one of your 90 days.</li>
          <li><strong>The Day of Departure is a Full Day:</strong> The day you leave the Schengen Area also counts as a full day. If your flight departs at 12:05 AM on a Friday, that Friday is still counted against your allowance.</li>
        </ol>
        <p>
          A trip from a Monday to the following Friday is therefore counted as 5 days, not 3.
        </p>
      </section>

      <section>
        <h2>What is the "Rolling 180-Day Period"?</h2>
        <p>
          This is the core of the calculation. It is not a fixed block of time. It is a "look-back" period from a specific date.
        </p>
        <p>
          To check if you are compliant <strong>today</strong>, you must:
        </p>
        <ol>
          <li>Identify today's date.</li>
          <li>Count back 180 days from today to find the start of your rolling window.</li>
          <li>Sum up every single day you spent inside the Schengen Area within that 180-day window.</li>
          <li>If the total is 90 or less, you are compliant. If it is 91 or more, you are in an overstay situation.</li>
        </ol>
        <p>
          Our <a href="/">Schengen calculator</a> performs this look-back calculation automatically for any date, removing the risk of human error.
        </p>
      </section>

      <section>
        <h2>Example Calculation</h2>
        <p>Let's say you have made the following trips:</p>
        <ul>
          <li><strong>Trip 1:</strong> January 1st - January 30th (30 days)</li>
          <li><strong>Trip 2:</strong> March 1st - March 30th (30 days)</li>
          <li><strong>Trip 3:</strong> May 1st - May 30th (30 days)</li>
        </ul>
        <p>
          By May 30th, you have used all 90 days. If you want to return on June 15th, you must look back 180 days from June 15th. In this window, all 90 of your previous days still fall. Your total is 90, so you have 0 days remaining and cannot enter.
        </p>
        <p>
          You would need to wait until your days from Trip 1 start to "expire" from the 180-day window before you regain eligible days to re-enter.
        </p>
      </section>

      <section>
        <h2>Let the Calculator Handle It</h2>
        <p>
          Manual counting is prone to error. Our tool is designed specifically to handle these complex calculations with precision. Enter your travel history and let the calculator give you a definitive answer in seconds.
        </p>
      </section>
    </div>
  );
}