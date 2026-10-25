// Difficulty-based lesson extras ("In simple words" for Beginner, "Go deeper" for Advanced)
// and three advanced courses (hidden on Beginner difficulty).
// Amounts are written with "$" and swapped for the player's currency at render time.
window.MQ = window.MQ || {};

(function (MQ) {
  MQ.LESSON_EXTRA = {
    'teen-1': { simple: 'Pocket money is your first income. Agree what it pays for, split it into Spend, Save and Give, and keep track of it.', deep: ['Zero-based budgeting', 'Give every bit of money a job before the month starts, so income − planned spending − planned saving = 0. Money with no job is where impulse spending happens.'] },
    'teen-2': { simple: 'Game money like gems is real money in disguise. Always work out the real price before you buy.', deep: ['Dark patterns', 'Games use design tricks: bundle sizes that always leave leftover gems, countdown timers and "so close!" animations. Spotting the trick is the first step to resisting it.'] },
    'teen-3': { simple: 'It is okay to say no to spending. Real friends understand, and free plans can be just as fun.', deep: ['Social comparison', 'People tend to judge how well-off they are compared with friends, not in absolute terms. That is why spending creeps up when everyone around you spends more, a pattern often called "keeping up with the Joneses".'] },
    'teen-4': { simple: 'Pick one goal. Price ÷ what you save each week = how many weeks it takes.', deep: ['Sinking funds', 'For big costs you know are coming (a phone upgrade, a trip), save a fixed amount every month into a separate pot. When the bill arrives it is already paid for, with no debt and no stress.'] },
    'basics-1': { simple: 'Needs keep you healthy, safe and learning. Wants are nice extras. Cover needs first.', deep: ['Opportunity cost of time', 'Opportunity cost applies to time too. The true cost of a choice is the value of the best alternative you gave up, whether that is money, hours or another chance.'] },
    'basics-2': { simple: 'A budget is just a plan: money in, money out. 50% needs, 30% wants, 20% savings is a simple start.', deep: ['Beyond 50/30/20', '50/30/20 is a rule of thumb, not a law. People with big goals often "pay themselves first" with 30% or more, and zero-based budgeting tracks every bit of money.'] },
    'basics-3': { simple: 'Small things you buy often add up to a lot. Write down what you spend for a month to find them.', deep: ['Cost per use', 'Divide a price by how many times you will really use it. A $60 jacket worn 60 times costs $1 per wear; a $30 top worn twice costs $15 per wear.'] },
    'saving-1': { simple: 'Save first, then spend. Keep some money for emergencies so surprises do not turn into debt.', deep: ['Liquidity and buckets', 'Emergency money must be easy to reach quickly, so keep it in a savings account. Long-term money can be locked away or invested for higher returns. Matching money to when you need it is called "bucketing".'] },
    'saving-2': { simple: 'A bank keeps your money safe. A debit card spends your own money; a credit card borrows the bank\'s.', deep: ['The interest spread', 'Banks pay savers interest because they lend deposits to borrowers at higher rates. The gap between the two rates is the interest spread, and it is a big part of how banks make money.'] },
    'saving-3': { simple: 'Compound interest means your interest earns interest too. The earlier you start, the more it grows.', deep: ['The compound formula', 'A = P × (1 + r/n)^(n × t), where n is how often interest is added each year. More frequent compounding helps slightly, which is why banks quote an effective yearly rate (AER or APY).'] },
    'earning-1': { simple: 'Gross pay is before deductions. Net pay is what you actually get. Budget with net pay.', deep: ['Effective vs marginal tax', 'In a progressive system your effective tax rate (total tax ÷ total income) is always lower than your top (marginal) rate, because the lower slices of income are taxed at lower rates.'] },
    'earning-2': { simple: 'Taxes pay for roads, schools and hospitals. You already pay tax on things you buy.', deep: ['Progressive, regressive, proportional', 'Progressive taxes take a bigger share from higher earners (income tax). Regressive taxes take a bigger share of a lower earner\'s income (a flat sales tax on essentials). Proportional taxes take the same percentage from everyone.'] },
    'earning-3': { simple: 'You can earn with a job or by selling a skill or product. Profit is what is left after costs.', deep: ['Profit margin', 'Margin = profit ÷ revenue. Selling 100 bracelets at $10 that cost $6 each gives $400 profit on $1,000 revenue: a 40% margin. Comparing margins shows which side hustle is really worth your time.'] },
    'credit-1': { simple: 'Borrowing means using someone else\'s money and paying it back, usually with extra called interest.', deep: ['Pricing risk', 'Lenders charge riskier borrowers higher interest. The same loan can cost two people very different amounts, which is why your credit history matters.'] },
    'credit-2': { simple: 'Pay the full credit card bill every month and it costs nothing extra. Pay only the minimum and it gets very expensive.', deep: ['How card interest really works', 'Card interest is often worked out daily on your balance, and many cards remove the interest-free period on new purchases once you carry a balance. Small leftover balances can get expensive fast.'] },
    'credit-3': { simple: 'A credit score shows lenders how reliably you pay back. Paying on time matters most.', deep: ['Hard vs soft checks', 'A hard inquiry (when you apply for credit) can lower your score a little for a while. A soft inquiry (checking your own score) does not. Spacing out applications keeps your score steadier.'] },
    'investing-1': { simple: 'Investments that can grow more can also fall more. Money you need soon should stay safe.', deep: ['Volatility and the risk premium', 'Volatility measures how much prices swing. Over long periods, broad stock markets have historically returned more than cash, but with big drops along the way. That extra expected return is called the equity risk premium.'] },
    'investing-2': { simple: 'A stock is a piece of a company. A bond is a loan. A fund holds lots of them together.', deep: ['Why bond prices fall when rates rise', 'If new bonds pay higher interest, older bonds paying less become less attractive, so their prices drop. That is why many bonds lost value in 2022 when interest rates jumped.'] },
    'investing-3': { simple: 'Do not put all your money in one place. Spreading it out makes big losses less likely.', deep: ['Correlation', 'Diversification works best when assets do not move together. Correlation measures this: combining assets with low or negative correlation can make a portfolio less risky than either one alone.'] },
    'safety-1': { simple: 'If a message rushes you, asks for codes or promises easy money, it is probably a scam.', deep: ['Social engineering', 'Most scams hack people, not computers: they exploit trust, fear, urgency and authority. Pausing and checking through an official channel defeats almost every version.'] },
    'safety-2': { simple: 'Use strong passwords, turn on two-step login, and never share codes or PINs.', deep: ['Beyond SMS codes', 'Authenticator apps and passkeys are safer than text-message codes, because "SIM swap" attacks can let criminals receive your texts. Use them for your most important accounts.'] },
    'safety-3': { simple: 'Ads and influencers want you to buy. Wait a day and compare prices before you spend.', deep: ['Anchoring', 'Showing a high "original" price makes the sale price feel cheap. Judge the price on its own: would you pay this if there were no crossed-out number?'] }
  };

  MQ.ADV_UNITS = [
    {
      id: 'adv-markets', advanced: true, title: 'Investing Deep Dive', emoji: '📊', color: '#0ea5e9',
      blurb: 'Index vs active funds, asset allocation, rebalancing and how to value a company.',
      lessons: [
        {
          id: 'adv-markets-1', title: 'Index vs Active Funds', emoji: '🥊', cat: 'investing',
          cards: [
            { emoji: '🧑‍💼', title: 'Active funds', body: 'An <b>active fund</b> pays managers to pick investments they think will beat the market. That research costs money, so fees are higher.' },
            { emoji: '📊', title: 'Index funds', body: 'An <b>index fund</b> simply copies a market index (like the S&P 500 or Nifty 50). No stock-picking, so fees are usually very low.' },
            { emoji: '📉', title: 'Who wins?', body: 'Studies such as S&P\'s SPIVA reports have repeatedly found that <b>most active funds trail their index over 10–15 years</b> after fees. Beating the market consistently is very hard.' },
            { emoji: '🧾', title: 'The expense ratio', body: 'A fund\'s yearly fee is its <b>expense ratio</b>. On $10,000, a 1% fee costs $100 a year and a 0.1% fee costs $10. Over decades, with compounding, that gap can grow into thousands.' }
          ],
          quiz: [
            { q: 'What does an index fund do?', options: ['Picks the managers\' favourite stocks', 'Copies a whole market index', 'Only buys bonds', 'Guarantees a profit'], answer: 1, explain: 'It tracks an index instead of picking stocks.' },
            { q: 'Why are active funds usually more expensive?', options: ['They pay for research and stock-picking', 'They are safer', 'The government taxes them more', 'They hold fewer companies'], answer: 0, explain: 'Managers and research cost money, passed on as fees.' },
            { q: 'On $10,000, how much is a 0.5% yearly expense ratio?', options: ['$5', '$50', '$500', '$0.50'], answer: 1, explain: '0.5% of $10,000 = $50 a year.' },
            { q: 'Over 10–15 years, most active funds...', options: ['Beat their index easily', 'Trail their index after fees', 'Never lose money', 'Match the index exactly'], answer: 1, explain: 'Long-term studies show most underperform after fees.' }
          ]
        },
        {
          id: 'adv-markets-2', title: 'Asset Allocation & Rebalancing', emoji: '⚖️', cat: 'risk',
          cards: [
            { emoji: '🥧', title: 'Asset allocation', body: 'Your <b>asset allocation</b> is the mix of stocks, bonds and cash you hold. It drives most of how much your portfolio swings up and down.' },
            { emoji: '⏳', title: 'Time horizon', body: 'Money for 30+ years can usually hold more stocks; money needed in 3 years needs more bonds and cash. Many people shift towards safer assets as their goal gets closer.' },
            { emoji: '🔄', title: 'Rebalancing', body: 'Markets move and your mix drifts. <b>Rebalancing</b> means selling some of what grew too big and buying what fell below target. It quietly makes you sell high and buy low.' },
            { emoji: '🎯', title: 'Target-date funds', body: 'A target-date fund (e.g. "2060 fund") does this automatically: lots of stocks while the date is far away, gradually more bonds as it gets closer. This path is called a <b>glide path</b>.' }
          ],
          quiz: [
            { q: 'Asset allocation means...', options: ['Choosing one perfect stock', 'Your mix of stocks, bonds and cash', 'How often you check prices', 'Your bank\'s interest rate'], answer: 1, explain: 'It is the overall mix, which drives most of your risk.' },
            { q: 'Your target is 70% stocks / 30% bonds. After a boom you hold 80/20. Rebalancing means...', options: ['Buying more stocks', 'Selling some stocks and buying bonds', 'Selling everything', 'Doing nothing ever'], answer: 1, explain: 'Bring it back to 70/30 by trimming what grew.' },
            { q: 'Someone saving for a house in 2 years should usually hold...', options: ['Mostly stocks', 'Mostly safer assets like cash and bonds', 'Only crypto', 'Only one company'], answer: 1, explain: 'Short horizon means less time to recover from a crash.' },
            { q: 'A target-date fund\'s "glide path" means it...', options: ['Gets riskier over time', 'Gets safer as the target date nears', 'Never changes', 'Only holds cash'], answer: 1, explain: 'It shifts from stocks to bonds as the date approaches.' }
          ]
        },
        {
          id: 'adv-markets-3', title: 'Valuing a Company', emoji: '🔍', cat: 'investing',
          cards: [
            { emoji: '🏢', title: 'Market capitalisation', body: '<b>Market cap</b> = share price × number of shares. A company with 2 million shares at $50 is worth $100 million on the stock market.' },
            { emoji: '💵', title: 'Earnings per share', body: '<b>EPS</b> = company profit ÷ number of shares. It tells you how much profit each share "owns".' },
            { emoji: '📐', title: 'The P/E ratio', body: '<b>P/E</b> = share price ÷ EPS. A P/E of 20 means investors pay $20 for every $1 of yearly profit. A high P/E can mean big growth is expected, or that the stock is expensive.' },
            { emoji: '🎁', title: 'Dividend yield', body: '<b>Dividend yield</b> = yearly dividend ÷ share price. A $2 dividend on a $50 share is a 4% yield.' }
          ],
          quiz: [
            { q: 'Share price $20, 5 million shares. Market cap?', options: ['$4 million', '$25 million', '$100 million', '$20 million'], answer: 2, explain: '$20 × 5 million = $100 million.' },
            { q: 'Share price $30, EPS $3. What is the P/E ratio?', options: ['3', '10', '30', '90'], answer: 1, explain: '$30 ÷ $3 = 10.' },
            { q: 'A very high P/E ratio usually means investors...', options: ['Expect strong future growth (or the stock is pricey)', 'Think the company is bankrupt', 'Get a guaranteed dividend', 'Pay no tax'], answer: 0, explain: 'They pay a lot per $1 of today\'s profit.' },
            { q: 'Yearly dividend $1, share price $25. Dividend yield?', options: ['1%', '4%', '25%', '2.5%'], answer: 1, explain: '$1 ÷ $25 = 4%.' }
          ]
        }
      ]
    },
    {
      id: 'adv-econ', advanced: true, title: 'How the Economy Works', emoji: '🌐', color: '#f59e0b',
      blurb: 'Inflation, central banks, interest rates and exchange rates, and how they hit your wallet.',
      lessons: [
        {
          id: 'adv-econ-1', title: 'Inflation & Central Banks', emoji: '🏛️', cat: 'investing',
          cards: [
            { emoji: '🎈', title: 'Why prices rise', body: '<b>Demand-pull</b> inflation: people want to buy more than the economy can make. <b>Cost-push</b> inflation: costs like fuel or wages rise and firms pass them on.' },
            { emoji: '🏛️', title: 'Central banks', body: 'The RBI (India), the Federal Reserve (US) and the Bank of England (UK) try to keep inflation near a target: about 4% for India, 2% for the US and UK.' },
            { emoji: '🔧', title: 'Their main tool', body: 'To cool inflation they <b>raise interest rates</b>. Borrowing gets more expensive, people and businesses spend less, and price rises slow. To boost a weak economy they cut rates.' },
            { emoji: '➖', title: 'Real interest rates', body: 'Real rate ≈ interest rate − inflation. Savings earning 6% with 4% inflation grow your buying power by only about 2% a year.' }
          ],
          quiz: [
            { q: 'To bring down high inflation, central banks usually...', options: ['Cut interest rates', 'Raise interest rates', 'Print more money', 'Lower taxes'], answer: 1, explain: 'Higher rates cool borrowing and spending.' },
            { q: 'Fuel prices jump and companies raise prices to cover it. This is...', options: ['Demand-pull inflation', 'Cost-push inflation', 'Deflation', 'A recession'], answer: 1, explain: 'Rising costs pushed prices up.' },
            { q: 'Savings earn 5% and inflation is 7%. Your real return is roughly...', options: ['+12%', '+2%', '−2%', '0%'], answer: 2, explain: '5% − 7% ≈ −2%: your buying power shrinks.' },
            { q: 'The US Federal Reserve\'s inflation target is about...', options: ['0%', '2%', '10%', '25%'], answer: 1, explain: 'The Fed and the Bank of England target 2%; India\'s RBI targets 4%.' }
          ]
        },
        {
          id: 'adv-econ-2', title: 'Interest Rates Everywhere', emoji: '📈', cat: 'credit',
          cards: [
            { emoji: '🏠', title: 'Loans and EMIs', body: 'When the central bank raises rates, banks usually raise their lending rates too, so <b>floating-rate</b> loans get more expensive. Fixed-rate loans stay the same until the fixed period ends.' },
            { emoji: '🐷', title: 'Savings', body: 'Higher rates are good news for savers: savings accounts and fixed deposits usually start paying more.' },
            { emoji: '📜', title: 'Bonds and stocks', body: 'Rising rates usually push existing bond prices down, and can weigh on stock prices because future profits are worth less in today\'s money.' },
            { emoji: '⚖️', title: 'Fixed or floating?', body: 'Fixed rates give certainty. Floating rates can be cheaper when rates fall, but riskier when they rise. Choose based on how much uncertainty your budget can handle.' }
          ],
          quiz: [
            { q: 'Rates go up. What happens to a floating-rate loan\'s EMI?', options: ['It usually goes up', 'It always goes down', 'Nothing ever', 'The loan is cancelled'], answer: 0, explain: 'Floating rates follow benchmark rates.' },
            { q: 'Rising interest rates are usually good news for...', options: ['Borrowers', 'Savers', 'Existing bond holders', 'Nobody'], answer: 1, explain: 'Savings start paying more.' },
            { q: 'When rates rise, the price of an existing bond usually...', options: ['Rises', 'Falls', 'Stays exactly the same', 'Doubles'], answer: 1, explain: 'New bonds pay more, so old ones are less attractive.' },
            { q: 'A fixed-rate loan is best for someone who wants...', options: ['Certainty about payments', 'To gamble on rates falling', 'No interest at all', 'To pay nothing back'], answer: 0, explain: 'Fixed payments are predictable.' }
          ]
        },
        {
          id: 'adv-econ-3', title: 'Exchange Rates & Global Money', emoji: '💱', cat: 'investing',
          cards: [
            { emoji: '💱', title: 'What an exchange rate is', body: 'An <b>exchange rate</b> is the price of one currency in another, like how many rupees one US dollar costs. It changes every day with trade, interest rates and confidence.' },
            { emoji: '📱', title: 'A weaker currency', body: 'If your currency weakens, <b>imports cost more</b> (phones, fuel, foreign holidays, studying abroad) while your country\'s exports become cheaper for foreigners.' },
            { emoji: '🎓', title: 'Why it matters to you', body: 'Planning to study abroad? A 10% fall in your currency makes fees 10% more expensive in your money. Some families save part of the money in the foreign currency ahead of time.' },
            { emoji: '🌍', title: 'Global diversification', body: 'Investing in more than one country spreads currency and economic risk, so a slump at home does not hit everything you own.' }
          ],
          quiz: [
            { q: 'Your currency weakens against the dollar. A phone priced in dollars becomes...', options: ['Cheaper for you', 'More expensive for you', 'Free', 'Unchanged'], answer: 1, explain: 'You need more of your currency to buy the same dollars.' },
            { q: 'A weaker currency usually helps...', options: ['Exporters', 'People holidaying abroad', 'Importers', 'Students paying foreign fees'], answer: 0, explain: 'Their goods become cheaper for foreign buyers.' },
            { q: 'Foreign university fees are $20,000. Your currency falls 10%. The cost in your money...', options: ['Falls 10%', 'Rises about 10%', 'Stays the same', 'Halves'], answer: 1, explain: 'Each dollar now costs about 10% more of your money.' },
            { q: 'Investing in several countries mainly helps by...', options: ['Guaranteeing profit', 'Spreading economic and currency risk', 'Avoiding all fees', 'Removing all risk'], answer: 1, explain: 'It is diversification across economies.' }
          ]
        }
      ]
    },
    {
      id: 'adv-biz', advanced: true, title: 'Entrepreneur\'s Toolkit', emoji: '🚀', color: '#ec4899',
      blurb: 'Break-even, pricing, margins and cash flow, the maths behind any business.',
      lessons: [
        {
          id: 'adv-biz-1', title: 'Costs & Break-even', emoji: '⚖️', cat: 'earning',
          cards: [
            { emoji: '🏠', title: 'Fixed costs', body: '<b>Fixed costs</b> stay the same however much you sell: rent, a website subscription, equipment.' },
            { emoji: '📦', title: 'Variable costs', body: '<b>Variable costs</b> rise with every unit you make: ingredients, packaging, delivery.' },
            { emoji: '➗', title: 'Contribution per unit', body: 'Price − variable cost = how much each sale <b>contributes</b> towards paying fixed costs. Selling at $15 with $5 of variable cost contributes $10.' },
            { emoji: '🎯', title: 'Break-even', body: 'Break-even units = fixed costs ÷ contribution per unit. With $600 of monthly fixed costs and $10 contribution, you need to sell <b>60 units</b> a month before you make any profit.' }
          ],
          quiz: [
            { q: 'Which is a fixed cost for a T-shirt business?', options: ['Blank T-shirts', 'Ink per shirt', 'Monthly website fee', 'Postage per order'], answer: 2, explain: 'The website fee does not change with sales.' },
            { q: 'Price $12, variable cost $4. Contribution per unit?', options: ['$16', '$8', '$3', '$4'], answer: 1, explain: '$12 − $4 = $8.' },
            { q: 'Fixed costs $400, contribution $8 per unit. Break-even units?', options: ['32', '50', '400', '8'], answer: 1, explain: '$400 ÷ $8 = 50 units.' },
            { q: 'Selling more units than break-even means...', options: ['A loss', 'A profit', 'Exactly zero', 'Higher fixed costs'], answer: 1, explain: 'Every unit past break-even adds profit.' }
          ]
        },
        {
          id: 'adv-biz-2', title: 'Pricing & Margins', emoji: '🏷️', cat: 'earning',
          cards: [
            { emoji: '📈', title: 'Markup', body: '<b>Markup</b> = profit ÷ cost. Buying at $60 and selling at $100 is a 67% markup.' },
            { emoji: '🥧', title: 'Margin', body: '<b>Margin</b> = profit ÷ price. The same sale is a 40% margin. Markup and margin are often confused; margin is always the smaller number.' },
            { emoji: '🧠', title: 'Pricing strategies', body: '<b>Cost-plus</b> (cost + a set markup), <b>value-based</b> (what customers think it\'s worth) and <b>competitive</b> (around rivals\' prices) are the most common ways to set a price.' },
            { emoji: '✂️', title: 'Careful with discounts', body: 'A 20% discount on a product with a 40% margin cuts your profit per sale in half. You would need to sell twice as many just to earn the same.' }
          ],
          quiz: [
            { q: 'Cost $50, price $80. What is the margin?', options: ['30%', '37.5%', '60%', '62.5%'], answer: 1, explain: 'Profit $30 ÷ price $80 = 37.5%.' },
            { q: 'Cost $50, price $80. What is the markup?', options: ['30%', '37.5%', '60%', '160%'], answer: 2, explain: 'Profit $30 ÷ cost $50 = 60%.' },
            { q: 'Pricing based on what customers believe something is worth is...', options: ['Cost-plus', 'Value-based', 'Random', 'Competitive'], answer: 1, explain: 'Value-based pricing focuses on perceived value.' },
            { q: 'Why can discounts be dangerous for a small business?', options: ['They are illegal', 'They can wipe out much of the profit per sale', 'They raise fixed costs', 'Customers hate them'], answer: 1, explain: 'A discount comes straight out of your margin.' }
          ]
        },
        {
          id: 'adv-biz-3', title: 'Cash Flow & Funding', emoji: '💧', cat: 'earning',
          cards: [
            { emoji: '⏰', title: 'Profit is not cash', body: 'A business can be profitable on paper and still run out of money if customers pay late while bills are due now. <b>Cash flow</b> is about timing.' },
            { emoji: '📅', title: 'Cash flow forecast', body: 'List the money coming in and going out each month. It shows ahead of time when you might run short, so you can act early.' },
            { emoji: '💰', title: 'Ways to fund a business', body: '<b>Bootstrapping</b> (your own money), <b>loans</b> (repay with interest, you keep ownership) or <b>investors</b> (they give money for a share of ownership, called <b>equity</b>).' },
            { emoji: '🧾', title: 'Keep it separate', body: 'Use a separate account for business money. It makes tracking profit, cash flow and any taxes far easier.' }
          ],
          quiz: [
            { q: 'Why can a profitable business still run out of cash?', options: ['Profit is always fake', 'Customers may pay later than bills are due', 'Cash flow does not matter', 'Taxes are optional'], answer: 1, explain: 'Timing of money in and out matters.' },
            { q: 'Giving an investor 20% of your company in exchange for money is selling...', options: ['A loan', 'Equity', 'A bond', 'Inventory'], answer: 1, explain: 'Equity = ownership.' },
            { q: 'Funding a business with your own savings is called...', options: ['Bootstrapping', 'Crowd-lending', 'Leverage', 'Dividends'], answer: 0, explain: 'Bootstrapping means self-funding.' },
            { q: 'A cash flow forecast mainly helps you...', options: ['Avoid paying tax', 'Spot months when you could run short', 'Increase prices', 'Hire faster'], answer: 1, explain: 'It shows future cash gaps early.' }
          ]
        }
      ]
    }
  ];
  MQ.ADV_UNITS.forEach(u => u.lessons.forEach((l, i) => { MQ.LESSONS[l.id] = Object.assign(l, { unitId: u.id, index: i }); }));
})(window.MQ);
