// Quizzes and Unit Tests (like Khan Academy): a mid-unit quiz after lesson 2 and a unit test at the end.
// Questions come in seven types: multiple choice, true/false, select-all, number, put-in-order, matching
// and short answer (SAQ). Short answers are auto-marked by looking for key ideas, then a model answer is shown.
// Each authored question has a lesson index `l` (for quizzes) and an optional level `lv`:
// 1 = everyone, 2 = Standard and Advanced, 3 = Advanced only.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, sound, shuffle } = MQ.ui;
  const ST = MQ.state;

  MQ.TESTS = {
    teen: [
      { t: 'num', l: 3, q: 'You want headphones that cost $240. You save $15 a week. How many weeks until you can buy them?', answer: 16, suffix: 'weeks', explain: '$240 ÷ $15 = 16 weeks.' },
      { t: 'multi', l: 0, q: 'Which of these could count as income for a teen? Select all that apply.', options: ['Pocket money', 'Birthday money from family', 'A loan from a friend', 'Selling old books'], answers: [0, 1, 3], explain: 'A loan is not income: you have to pay it back.' },
      { t: 'order', l: 3, q: 'Put these steps for saving towards a goal in a sensible order.', items: ['Pick a goal and find its price', 'Work out how much to save each week', 'Put the savings aside as soon as you get money', 'Track progress and adjust'], explain: 'Goal first, then a plan, then save first, then track.' },
      { t: 'saq', l: 2, q: 'Your friends want to go to a concert that costs $60, but you are saving for a new phone. In a few sentences, what could you do and why?', ideas: [['Weigh the trade-off against your goal', ['goal', 'phone', 'saving', 'delay', 'longer', 'trade', 'opportunity']], ['Suggest an alternative or compromise', ['cheaper', 'free', 'instead', 'alternative', 'another', 'suggest', 'skip', 'next time']], ['Be honest or check your budget', ['budget', 'honest', 'tell', 'afford', 'say no', 'plan']]], need: 2, model: 'I would check my budget and see how much the concert would delay my phone goal. If it pushes the goal back a lot, I would be honest with my friends and suggest a cheaper or free plan instead, or go next time.' },
      { t: 'num', l: 1, lv: 2, q: '100 gems cost $1. A skin costs 600 gems. What is the real price of the skin in dollars?', answer: 6, prefix: '$', explain: '600 ÷ 100 = 6, so $6.' },
      { t: 'match', l: 1, q: 'Match each in-game term to what it means.', pairs: [['Loot box', 'Pay for a random reward'], ['Battle pass', 'Pay to unlock rewards by playing over a season'], ['Gems or coins', 'Game currency bought with real money']], explain: 'Knowing the mechanics helps you see the real cost.' },
      { t: 'tf', l: 2, q: 'If all your friends are buying something, it must be good value.', answer: false, explain: 'Peer pressure is not a price check. Decide based on your own budget and goals.' },
      { t: 'mcq', l: 0, q: 'You get $20 pocket money and use Spend / Save / Give jars at 50/40/10. How much goes in Save?', options: ['$2', '$8', '$10', '$12'], answer: 1, explain: '40% of $20 = $8.' },
      { t: 'saq', l: 1, lv: 3, q: 'Explain one design trick games use to make you spend more, and how you could resist it.', ideas: [['Name a trick', ['timer', 'limited', 'countdown', 'bundle', 'leftover', 'loot', 'random', 'rare', 'fomo']], ['A way to resist', ['wait', 'real price', 'convert', 'limit', 'budget', 'think', 'delete', 'ask']]], need: 2, model: 'Games use countdown timers and "limited time" offers to create FOMO. I can resist by waiting 24 hours, converting the gems to real money first and setting a monthly gaming budget.' }
    ],
    basics: [
      { t: 'multi', l: 0, q: 'Which of these are needs? Select all that apply.', options: ['Basic food', 'School supplies', 'Latest sneakers', 'A safe place to live', 'Streaming subscription'], answers: [0, 1, 3], explain: 'Needs keep you healthy, safe and learning.' },
      { t: 'num', l: 1, q: 'Using 50/30/20, how much of a $400 monthly budget goes to savings?', answer: 80, prefix: '$', explain: '20% of $400 = $80.' },
      { t: 'num', l: 2, q: 'A $3 drink every school day (about 180 days a year). How much is that per year?', answer: 540, prefix: '$', explain: '$3 × 180 = $540.' },
      { t: 'tf', l: 0, q: 'Opportunity cost is the value of the best option you gave up.', answer: true, explain: 'Every choice means giving something else up.' },
      { t: 'match', l: 1, q: 'Match each part of 50/30/20 to an example.', pairs: [['50% needs', 'Bus pass to school'], ['30% wants', 'Movie tickets'], ['20% savings', 'Money for a future laptop']], explain: 'Needs, wants, then saving for the future.' },
      { t: 'order', l: 1, q: 'Put the steps of making a budget in order.', items: ['Write down your income', 'List your expenses', 'Subtract expenses from income', 'Adjust until it balances'], explain: 'Income, expenses, compare, adjust.' },
      { t: 'saq', l: 2, q: 'What is a "spending leak" and how could you find yours?', ideas: [['Small, frequent spending that adds up', ['small', 'little', 'add up', 'adds up', 'often', 'daily', 'regular', 'frequent']], ['Track or review spending', ['track', 'write', 'record', 'app', 'note', 'review', 'check', 'list']]], need: 2, model: 'A spending leak is a small purchase you make often, like snacks or app subscriptions, that adds up to a lot over time. I could find mine by tracking everything I spend for a month and reviewing it.' },
      { t: 'num', l: 2, lv: 3, q: 'A $60 jacket is worn 60 times. A $30 top is worn twice. How much more per wear does the top cost than the jacket?', answer: 14, prefix: '$', explain: 'Top: $30 ÷ 2 = $15. Jacket: $60 ÷ 60 = $1. Difference $14.' },
      { t: 'saq', l: 0, lv: 2, q: 'Explain the difference between a need and a want, with one example of each.', ideas: [['Needs are essential', ['essential', 'survive', 'healthy', 'safe', 'must', 'necessary', 'need']], ['Wants are extras', ['extra', 'nice', 'luxury', 'fun', 'not necessary', 'want', 'optional']], ['Gives examples', ['food', 'water', 'rent', 'school', 'bus', 'clothes', 'game', 'phone', 'sneakers', 'movie', 'snack']]], need: 2, model: 'A need is something essential to stay healthy, safe and learning, like food or school supplies. A want is a nice extra you could live without, like a new game.' }
    ],
    saving: [
      { t: 'num', l: 2, q: 'You put $100 in an account paying 10% a year, compounded yearly. How much after 2 years?', answer: 121, prefix: '$', explain: '$100 × 1.1 × 1.1 = $121.' },
      { t: 'num', l: 2, lv: 2, q: 'Using the Rule of 72, about how many years does money take to double at 6% a year?', answer: 12, suffix: 'years', explain: '72 ÷ 6 = 12 years.' },
      { t: 'tf', l: 1, q: 'A debit card spends money borrowed from the bank.', answer: false, explain: 'Debit spends your own money; credit borrows.' },
      { t: 'match', l: 1, q: 'Match each account or card to what it does.', pairs: [['Savings account', 'Earns interest on money you keep'], ['Debit card', 'Spends money already in your account'], ['Credit card', 'Borrows money you must pay back']], explain: 'Know whose money you are spending.' },
      { t: 'multi', l: 0, q: 'Good reasons to have an emergency fund? Select all that apply.', options: ['A phone screen breaks', 'A surprise school trip fee', 'A sale on sneakers', 'Avoiding borrowing when surprises happen'], answers: [0, 1, 3], explain: 'Emergency funds are for surprises, not sales.' },
      { t: 'order', l: 2, lv: 2, q: 'Order these from LEAST to MOST money after 10 years (same $1,000 start).', items: ['Cash under the mattress', 'Savings account at 2%', 'Savings account at 4%', 'Account at 4%, adding $10 a month'], explain: 'Higher rates and regular deposits both grow money faster.' },
      { t: 'saq', l: 2, q: 'Why does starting to save early make such a big difference?', ideas: [['Compound interest / interest on interest', ['compound', 'interest on interest', 'interest on your interest', 'snowball', 'grows on itself']], ['More time to grow', ['time', 'longer', 'years', 'early']]], need: 2, model: 'Because of compound interest, your interest earns interest too. Starting early gives your money more years to snowball, so even small amounts can grow a lot.' },
      { t: 'mcq', l: 0, q: '"Pay yourself first" means...', options: ['Buy treats first', 'Save as soon as you get money, before spending', 'Pay bills last', 'Lend money to yourself'], answer: 1, explain: 'Saving first makes it automatic.' },
      { t: 'saq', l: 1, lv: 3, q: 'Explain how a bank can afford to pay you interest on your savings.', ideas: [['Banks lend your deposits', ['lend', 'loan', 'borrow']], ['They charge borrowers a higher rate', ['higher', 'more interest', 'spread', 'charge']]], need: 2, model: 'Banks lend the money savers deposit to borrowers and charge them a higher interest rate than they pay savers. The difference, called the spread, covers the interest they pay me and makes them a profit.' }
    ],
    earning: [
      { t: 'num', l: 0, q: 'You work 8 hours at $12 an hour and $10 is deducted. What is your net pay?', answer: 86, prefix: '$', explain: 'Gross $96 − $10 = $86.' },
      { t: 'match', l: 0, q: 'Match each payslip word to its meaning.', pairs: [['Gross pay', 'Total before deductions'], ['Net pay', 'What actually reaches your account'], ['Deductions', 'Money taken out, such as tax']], explain: 'Budget with net pay.' },
      { t: 'tf', l: 1, q: 'In a tax bracket system, moving into a higher bracket means ALL your income is taxed at the higher rate.', answer: false, lv: 2, explain: 'Only the part above the threshold is taxed at the higher rate.' },
      { t: 'multi', l: 1, q: 'Which are paid for by taxes? Select all that apply.', options: ['Public roads', 'State schools', 'Your phone bill', 'Fire services'], answers: [0, 1, 3], explain: 'Your phone bill is a private cost.' },
      { t: 'num', l: 2, q: 'You sell 20 bracelets for $5 each. Materials cost $40 in total. What is your profit?', answer: 60, prefix: '$', explain: 'Revenue $100 − costs $40 = $60.' },
      { t: 'saq', l: 2, q: 'Describe a side hustle a teen could start, and one cost they should plan for.', ideas: [['Names a hustle', ['tutor', 'sell', 'baking', 'bake', 'art', 'craft', 'design', 'pet', 'dog', 'babysit', 'lawn', 'video', 'edit', 'repair', 'teach', 'clean', 'car wash', 'tutoring']], ['Names a cost', ['cost', 'material', 'supplies', 'ingredients', 'time', 'fee', 'equipment', 'transport', 'ads', 'shipping']]], need: 2, model: 'I could start a baking stall at school events. I would need to plan for ingredients and packaging costs, and for my time, so my price needs to cover them and leave a profit.' },
      { t: 'num', l: 1, lv: 3, q: 'Tax is 0% on the first $10,000 and 20% on income above that. How much tax on $15,000?', answer: 1000, prefix: '$', explain: '20% × ($15,000 − $10,000) = $1,000.' },
      { t: 'order', l: 2, lv: 2, q: 'Put the steps of a simple side hustle in order.', items: ['Spot something people need', 'Work out your costs and price', 'Make or offer it', 'Count profit and improve'], explain: 'Idea, plan, sell, review.' }
    ],
    credit: [
      { t: 'order', l: 0, lv: 2, q: 'Order these $500 loans from CHEAPEST to MOST EXPENSIVE in total.', items: ['12 months at 10% APR', '24 months at 10% APR', '24 months at 20% APR', 'Payday loan at 400% APR'], explain: 'Lower rates and shorter terms cost less in total. Payday loans are extremely expensive.' },
      { t: 'num', l: 2, q: 'Your card limit is $1,000 and you owe $250. What is your credit utilization (%)?', answer: 25, suffix: '%', explain: '$250 ÷ $1,000 = 25%.' },
      { t: 'num', l: 0, q: 'You borrow $200 and pay back $20 a month for 12 months. How much interest did you pay in total?', answer: 40, prefix: '$', explain: '$20 × 12 = $240 paid. $240 − $200 = $40 interest.' },
      { t: 'tf', l: 1, q: 'Paying only the minimum on a credit card is a cheap way to borrow.', answer: false, explain: 'Interest keeps piling up on the rest, so it can take years and cost a lot.' },
      { t: 'multi', l: 2, q: 'Which help build a good credit score? Select all that apply.', options: ['Paying bills on time', 'Using most of your limit every month', 'Keeping balances low', 'Missing payments'], answers: [0, 2], explain: 'On-time payments and low utilization help most.' },
      { t: 'match', l: 1, q: 'Match each term to its meaning.', pairs: [['APR', 'Yearly cost of borrowing'], ['Minimum payment', 'Smallest amount you must pay each month'], ['Credit limit', 'The most you can borrow on a card']], explain: 'Read the terms before you borrow.' },
      { t: 'saq', l: 0, q: 'Before borrowing money, what questions should you ask yourself?', ideas: [['Do I really need it / can I wait?', ['need', 'wait', 'save instead', 'necessary', 'really']], ['Total cost / interest', ['interest', 'cost', 'apr', 'total', 'fees']], ['Can I afford repayments?', ['afford', 'pay back', 'repay', 'monthly', 'budget']]], need: 2, model: 'I should ask whether I really need it now or could save up instead, how much it will cost in total with interest and fees, and whether I can afford the repayments every month.' },
      { t: 'saq', l: 2, lv: 3, q: 'Explain why a long loan term with small payments can be a trap.', ideas: [['More total interest', ['interest', 'more in total', 'total', 'cost more', 'pay more']], ['Small payment feels affordable', ['small', 'cheap', 'affordable', 'feels', 'looks', 'monthly']]], need: 2, model: 'A long term makes the monthly payment look small and affordable, but you pay interest for many more months, so the total cost is much higher.' }
    ],
    investing: [
      { t: 'order', l: 0, q: 'Order from LOWEST to HIGHEST usual risk.', items: ['Savings account', 'Government bonds', 'Index fund', 'Single small company stock'], explain: 'More potential return usually means more risk.' },
      { t: 'tf', l: 2, q: 'Diversification means putting all your money in the single best stock.', answer: false, explain: 'It means spreading money across many investments.' },
      { t: 'num', l: 1, lv: 2, q: 'Your investment returns 7% in a year while inflation is 3%. What is your approximate real return (%)?', answer: 4, suffix: '%', explain: 'Real return ≈ 7% − 3% = 4%.' },
      { t: 'match', l: 1, q: 'Match each investment to what you own.', pairs: [['Stock', 'A small piece of a company'], ['Bond', 'A loan to a government or company'], ['Index fund', 'A basket of many companies']], explain: 'Each carries different risk.' },
      { t: 'multi', l: 0, q: 'Which are sensible for money you need in 3 months? Select all that apply.', options: ['Savings account', 'Trending crypto coin', 'Cash in a safe place', 'Single tech stock'], answers: [0, 2], explain: 'Short-term money should be safe and easy to reach.' },
      { t: 'saq', l: 2, q: 'Why do many people choose index funds instead of picking single stocks?', ideas: [['Diversified / spreads risk', ['diversif', 'spread', 'many companies', 'lots of', 'basket', 'risk']], ['Low cost / simple', ['cheap', 'low fee', 'fees', 'cost', 'simple', 'easy', 'less time']]], need: 2, model: 'An index fund holds many companies, so one company failing does not wipe you out. They also usually have low fees and need little time or research.' },
      { t: 'num', l: 1, lv: 3, q: 'You invest $1,000 at 10% a year for 3 years (compounded). How much do you have? (to the nearest dollar)', answer: 1331, prefix: '$', explain: '$1,000 × 1.1³ = $1,331.' },
      { t: 'saq', l: 0, lv: 2, q: 'The market drops 20% in a month. You invested for 10+ years. What should you do and why?', ideas: [['Stay calm / do not panic sell', ['hold', 'stay', 'not sell', "don't sell", 'dont sell', 'calm', 'panic', 'wait']], ['Long time horizon / markets recover', ['long', 'recover', 'years', 'bounce', 'time']]], need: 2, model: 'I would stay calm and avoid panic selling, because I invested for more than 10 years and markets have historically recovered over long periods. Selling would lock in the loss.' }
    ],
    safety: [
      { t: 'multi', l: 0, q: 'Which are red flags of a scam? Select all that apply.', options: ['"Act now or lose your account!"', 'Asking for your OTP code', 'A receipt from a shop you visited', 'Pay with gift cards', 'Guaranteed huge returns'], answers: [0, 1, 3, 4], explain: 'Urgency, codes, gift cards and guarantees are classic red flags.' },
      { t: 'order', l: 1, q: 'You get a text "from your bank" with a link. Put the safe steps in order.', items: ['Do not click the link', 'Find the bank\'s official number yourself', 'Call the bank to check', 'Report the message as spam'], explain: 'Never trust contact details inside a suspicious message.' },
      { t: 'tf', l: 1, q: 'Using the same password everywhere is fine if it is a strong one.', answer: false, explain: 'If one site leaks it, every account is at risk. Use a password manager.' },
      { t: 'match', l: 0, q: 'Match each scam to how it works.', pairs: [['Phishing', 'Fake message to steal your details'], ['Fake giveaway', 'Pay a "fee" to claim a prize'], ['Pump and dump', 'Hype a coin, then sell it on fans']], explain: 'Knowing the pattern makes them easy to spot.' },
      { t: 'saq', l: 0, q: 'A message says you won a new phone and only need to pay $5 shipping. What should you do and why?', ideas: [['Do not pay / ignore / report', ['ignore', 'delete', 'report', 'block', "don't pay", 'dont pay', 'not pay', 'never']], ['Recognise the scam sign', ['scam', 'fake', 'too good', 'fee', 'never entered', 'red flag', 'card details', 'steal']]], need: 2, model: 'I would not pay and would report and delete it. Real prizes do not ask you to pay a fee, and it is likely a scam to steal my card details. I never entered a competition anyway.' },
      { t: 'mcq', l: 2, q: 'An influencer says a coin will "100× guaranteed". The best response is...', options: ['Buy quickly', 'Be sceptical: guaranteed returns are a red flag', 'Borrow money to buy more', 'Share it with friends'], answer: 1, explain: 'Nothing is guaranteed in investing.' },
      { t: 'saq', l: 1, lv: 2, q: 'Name two ways to protect your online accounts.', ideas: [['Strong, unique passwords', ['password', 'passphrase', 'unique', 'manager']], ['Two-factor authentication', ['two-factor', '2fa', 'two factor', 'authenticat', 'code', 'otp']], ['Other good habits', ['update', 'never share', 'lock', 'phishing', 'public wifi', 'log out']]], need: 2, model: 'Use a strong, unique password for every account (a password manager helps) and turn on two-factor authentication. Also never share codes with anyone.' },
      { t: 'multi', l: 2, lv: 3, q: 'Which are signs a "limited time" online shop might be fake? Select all that apply.', options: ['Prices 80% below everywhere else', 'Only accepts bank transfer or crypto', 'Has clear return policy and reviews elsewhere', 'Brand new website with a countdown timer'], answers: [0, 1, 3], explain: 'Too-good prices, untraceable payments and pressure are warning signs.' }
    ],
    'adv-markets': [
      { t: 'num', l: 2, q: 'A company has 10 million shares priced at $10. What is its market cap in millions of dollars?', answer: 100, prefix: '$', suffix: 'million', explain: '10 million × $10 = $100 million.' },
      { t: 'num', l: 2, q: 'A share costs $40 and earnings per share are $2. What is the P/E ratio?', answer: 20, explain: '$40 ÷ $2 = 20.' },
      { t: 'num', l: 2, lv: 2, q: 'A $50 share pays a $2 yearly dividend. What is the dividend yield (%)?', answer: 4, suffix: '%', explain: '$2 ÷ $50 = 4%.' },
      { t: 'match', l: 0, q: 'Match each term to its meaning.', pairs: [['Index fund', 'Tracks a whole market automatically'], ['Active fund', 'A manager picks investments to beat the market'], ['Expense ratio', 'Yearly fee as a % of your money']], explain: 'Fees matter: most active funds trail the index after fees.' },
      { t: 'order', l: 1, q: 'Order these portfolios from LOWEST to HIGHEST expected risk.', items: ['20% stocks / 80% bonds', '50% stocks / 50% bonds', '80% stocks / 20% bonds', '100% one sector\'s stocks'], explain: 'More stocks and less diversification mean more risk.' },
      { t: 'tf', l: 1, q: 'Rebalancing means selling some of what has grown and buying what has lagged, to get back to your target mix.', answer: true, explain: 'It keeps your risk where you planned it.' },
      { t: 'saq', l: 0, q: 'Why do most active funds fail to beat index funds over the long run?', ideas: [['Higher fees', ['fee', 'cost', 'expense', 'charge']], ['Hard to consistently pick winners', ['hard', 'difficult', 'consistent', 'luck', 'predict', 'beat the market', 'pick']]], need: 2, model: 'Active funds charge higher fees, which eat into returns every year, and it is very hard to pick winning stocks consistently. Over many years most fall behind a cheap index fund.' },
      { t: 'saq', l: 2, lv: 3, q: 'Two companies have P/E ratios of 10 and 40. What might explain the difference, and what is one risk of the high-P/E stock?', ideas: [['Growth expectations', ['growth', 'grow', 'expect', 'future', 'optimis']], ['Risk of disappointment / overvaluation', ['overvalued', 'expensive', 'disappoint', 'fall', 'drop', 'bubble', 'risk', 'priced in']]], need: 2, model: 'Investors expect the P/E 40 company to grow much faster, so they pay more for each dollar of earnings today. The risk is that if growth disappoints, the price can fall sharply because so much is already priced in.' }
    ],
    'adv-econ': [
      { t: 'num', l: 0, q: 'Your savings earn 5% while inflation is 3%. What is your approximate real interest rate (%)?', answer: 2, suffix: '%', explain: '5% − 3% = 2%.' },
      { t: 'match', l: 0, q: 'Match each to its main job.', pairs: [['Central bank', 'Sets interest rates to manage inflation'], ['Government', 'Taxes and spends on public services'], ['Commercial bank', 'Takes deposits and makes loans']], explain: 'Monetary policy vs fiscal policy.' },
      { t: 'tf', l: 1, q: 'When a central bank raises interest rates, borrowing usually gets more expensive.', answer: true, explain: 'Higher rates cool spending and borrowing.' },
      { t: 'multi', l: 1, q: 'Higher interest rates usually... Select all that apply.', options: ['Make loans more expensive', 'Give savers more interest', 'Make house prices shoot up', 'Slow down inflation over time'], answers: [0, 1, 3], explain: 'Higher rates tend to cool, not heat, house prices.' },
      { t: 'num', l: 2, lv: 2, q: '1 USD = 80 INR. A game costs $15. How much is that in rupees?', answer: 1200, prefix: '₹', explain: '15 × 80 = ₹1,200.' },
      { t: 'order', l: 0, lv: 2, q: 'Put the chain of events in order when a central bank fights high inflation.', items: ['Central bank raises interest rates', 'Loans become more expensive', 'People and businesses spend less', 'Price rises slow down'], explain: 'Rates → borrowing → spending → inflation.' },
      { t: 'saq', l: 2, q: 'If your country\'s currency gets weaker, how could it affect what you buy?', ideas: [['Imports cost more', ['import', 'foreign', 'abroad', 'more expensive', 'cost more', 'pricier']], ['Examples or exports', ['phone', 'game', 'travel', 'holiday', 'online', 'export', 'tourist', 'electronics']]], need: 2, model: 'A weaker currency means imported things like phones, games and foreign holidays cost more, because each unit of my money buys less foreign currency. Exports become cheaper for other countries.' },
      { t: 'saq', l: 0, lv: 3, q: 'Explain why a little inflation (around 2%) is usually the target, rather than zero.', ideas: [['Deflation is harmful / people delay spending', ['deflation', 'delay', 'wait', 'cheaper later', 'falling prices']], ['Encourages spending and investing / growth', ['spend', 'invest', 'growth', 'economy', 'wages', 'jobs', 'buffer', 'room']]], need: 2, model: 'If prices fall (deflation), people delay buying because things will be cheaper later, which hurts businesses and jobs. A small, steady inflation encourages spending and investing and gives the central bank room to cut rates.' }
    ],
    'adv-biz': [
      { t: 'num', l: 0, q: 'Fixed costs are $600 a month. Each item sells for $15 and costs $5 to make. How many items to break even?', answer: 60, suffix: 'items', explain: '$600 ÷ ($15 − $5) = 60 items.' },
      { t: 'num', l: 1, q: 'A product costs $30 and sells for $50. What is the profit margin (%)?', answer: 40, suffix: '%', explain: 'Profit $20 ÷ price $50 = 40%.' },
      { t: 'num', l: 1, lv: 2, q: 'Same product: cost $30, price $50. What is the markup (%)? (1 decimal place)', answer: 66.7, tol: 0.15, suffix: '%', explain: 'Profit $20 ÷ cost $30 ≈ 66.7%.' },
      { t: 'match', l: 0, q: 'Match each cost to its type.', pairs: [['Market stall rent', 'Fixed cost'], ['Ingredients per cupcake', 'Variable cost'], ['Website subscription', 'Fixed cost'], ['Packaging per order', 'Variable cost']], explain: 'Fixed costs stay the same; variable costs grow with each sale.' },
      { t: 'order', l: 2, q: 'Order these funding options from MOST to LEAST ownership you keep.', items: ['Bootstrapping with your own savings', 'A bank loan', 'Selling 20% to an investor', 'Selling 60% to an investor'], explain: 'Loans keep ownership but must be repaid; equity gives part of the company away.' },
      { t: 'tf', l: 2, q: 'A profitable business can never run out of cash.', answer: false, explain: 'If customers pay late while bills are due now, cash can run out.' },
      { t: 'saq', l: 1, q: 'Explain why a 20% discount can be risky for a business with a 40% margin.', ideas: [['Discount cuts profit per sale', ['profit', 'margin', 'half', 'less money', 'cuts', 'eats']], ['Need to sell much more', ['sell more', 'many more', 'more items', 'more sales', 'twice', 'double', 'volume', 'more customers']]], need: 2, model: 'The discount comes straight out of the margin, so profit per sale falls from 40% to about 25% of the original price. The business would need to sell many more items just to earn the same profit.' },
      { t: 'saq', l: 2, lv: 3, q: 'You are choosing between a bank loan and an investor for your business. Give one advantage of each.', ideas: [['Loan keeps ownership/control', ['own', 'control', 'keep', 'ownership', 'equity']], ['Investor needs no repayment / brings help', ['repay', 'no interest', 'pay back', 'advice', 'experience', 'contacts', 'risk', 'help']]], need: 2, model: 'A loan lets me keep full ownership and control of my business. An investor does not need to be repaid with interest and may bring advice and contacts, but takes a share of ownership.' }
    ]
  };

  // ---------- Grading ----------
  function parseNum(s) {
    s = String(s || '').toLowerCase().replace(/[,\s]/g, '').replace(/[^0-9.\-]/g, '');
    if (!s || s === '-' || s === '.') return NaN;
    return parseFloat(s);
  }
  function wordCount(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
  function gradeSaq(q, text, need) {
    const t = ' ' + String(text || '').toLowerCase().replace(/[’']/g, "'") + ' ';
    const found = q.ideas.map(idea => idea[1].some(k => t.indexOf(k) >= 0));
    const n = found.filter(Boolean).length;
    if (wordCount(text) < 4) return { score: 0, found, short: true };
    return { score: Math.min(1, n / need), found };
  }
  // Returns { score 0..1, ...details }
  function grade(q, ans) {
    switch (q.t) {
      case 'mcq': return { score: ans === q.answer ? 1 : 0 };
      case 'tf': return { score: ans === q.answer ? 1 : 0 };
      case 'multi': {
        const want = q.answers.slice().sort().join(','), got = (ans || []).slice().sort().join(',');
        return { score: want === got ? 1 : 0 };
      }
      case 'num': {
        const v = parseNum(ans), tol = q.tol !== undefined ? q.tol : Math.max(0.01, Math.abs(q.answer) * 0.005);
        return { score: Math.abs(v - q.answer) <= tol ? 1 : 0 };
      }
      case 'order': return { score: (ans || []).join('|') === q.items.join('|') ? 1 : 0 };
      case 'match': {
        const right = q.pairs.filter((p, i) => ans && ans[i] === p[1]).length;
        return { score: right === q.pairs.length ? 1 : 0, right };
      }
      case 'saq': return gradeSaq(q, ans, q.needNow || q.need);
    }
    return { score: 0 };
  }

  // ---------- Building a test ----------
  const TYPE_NAMES = { mcq: 'Multiple choice', tf: 'True or false', multi: 'Select all that apply', num: 'Type a number', order: 'Put in order', match: 'Match up', saq: 'Short answer' };
  const testable = u => !!MQ.TESTS[u.id];
  function unitById(id) { return MQ.UNITS.concat(MQ.ADV_UNITS || []).find(u => u.id === id); }
  function lvOk(q, d) { const lv = q.lv || 1; return d === 'hard' ? true : d === 'normal' ? lv <= 2 : lv <= 1; }
  function sizes(kind) { return kind === 'quiz' ? MQ.diff(4, 5, 6) : MQ.diff(8, 10, 12); }
  function quizUpTo(u) { return Math.min(1, u.lessons.length - 1); } // quiz covers lessons 0..1

  function build(unit, kind) {
    const d = MQ.difficulty().id, n = sizes(kind);
    const maxL = kind === 'quiz' ? quizUpTo(unit) : 99;
    const authored = shuffle(MQ.TESTS[unit.id].filter(q => lvOk(q, d) && q.l <= maxL).map(q => Object.assign({}, q)));
    // Keep a good spread of types: at least one short answer, then prefer types not yet used.
    const picked = [], used = {};
    const want = Math.min(authored.length, kind === 'quiz' ? Math.ceil(n * 0.6) : Math.ceil(n * 0.7));
    const saq = authored.find(q => q.t === 'saq');
    if (saq) { picked.push(saq); used.saq = 1; }
    authored.filter(q => q !== saq && !used[q.t]).forEach(q => { if (picked.length < want) { picked.push(q); used[q.t] = 1; } });
    authored.filter(q => picked.indexOf(q) < 0).forEach(q => { if (picked.length < want) picked.push(q); });
    // Fill the rest with lesson questions and freshly generated ones (harder on higher difficulty).
    const lessons = unit.lessons.filter(l => l.index <= maxL);
    const bank = shuffle([].concat.apply([], lessons.map(l => l.quiz.map((q, i) => Object.assign({ t: 'mcq', l: l.index, qid: l.id + ':' + i, cat: MQ.adaptive.catOfLesson(l.id) }, q)))));
    const level = MQ.diff(1, 2, 3);
    let gi = 0;
    while (picked.length < n) {
      const fromGen = gi % 2 === 1 || !bank.length;
      if (fromGen) {
        const l = lessons[gi % lessons.length];
        picked.push(Object.assign({ t: 'mcq' }, MQ.adaptive.genQuestion(MQ.adaptive.catOfLesson(l.id), level)));
      } else picked.push(bank.shift());
      gi++;
    }
    // Lesson-tagged categories for the literacy score, and SAQ leniency on Beginner.
    return shuffle(picked).map(q => {
      if (!q.cat) q.cat = MQ.adaptive.catOfLesson((unit.lessons[q.l] || unit.lessons[0]).id);
      if (q.t === 'saq') q.needNow = d === 'easy' ? Math.max(1, q.need - 1) : q.need;
      if (q.t === 'order') q.shown = shuffleNot(q.items);
      if (q.t === 'match') q.choices = shuffle(q.pairs.map(p => p[1]).filter((c, i, a) => a.indexOf(c) === i));
      return q;
    });
  }
  function shuffleNot(items) { // a shuffle that is never already in the right order
    let s; let tries = 0;
    do { s = shuffle(items.slice()); tries++; } while (s.join('|') === items.join('|') && tries < 10);
    return s;
  }

  // ---------- Status helpers for the Learn page ----------
  function key(unitId, kind) { return unitId + ':' + kind; }
  function rec(unitId, kind) { const s = ST.get(); return (s.tests || {})[key(unitId, kind)]; }
  function masteryOf(p) { return p >= 0.9 ? ['Mastered', '🏆'] : p >= 0.7 ? ['Proficient', '⭐'] : p >= 0.5 ? ['Familiar', '👍'] : ['Attempted', '📘']; }
  function lessonsDone(unit, upto) { const s = ST.get(); return unit.lessons.filter(l => l.index <= upto).every(l => s.lessons[l.id] && s.lessons[l.id].done); }
  function nodeHtml(unit, kind) {
    if (!testable(unit)) return '';
    const upto = kind === 'quiz' ? quizUpTo(unit) : unit.lessons.length - 1;
    const open = lessonsDone(unit, upto), r = rec(unit.id, kind);
    const cls = r ? 'done' : open ? 'open' : 'locked';
    const label = kind === 'quiz' ? 'Quiz · lessons 1–' + (upto + 1) : 'Unit test';
    const sub = r ? masteryOf(r.best)[1] + ' ' + masteryOf(r.best)[0] + ' · best ' + Math.round(r.best * 100) + '%' : open ? sizes(kind) + ' questions · mixed types' : (kind === 'quiz' ? 'Finish lessons 1–' + (upto + 1) : 'Finish every lesson in this unit');
    return '<a class="node test-node ' + kind + ' ' + cls + '" ' + (open ? 'href="#/test/' + unit.id + '/' + kind + '"' : 'aria-disabled="true" data-msg="' + esc(sub) + '"') + '><span class="node-dot">' + (cls === 'locked' ? '🔒' : kind === 'quiz' ? '📝' : '🏁') + '</span><span class="node-title">' + label + '<small class="muted">' + esc(sub) + '</small></span></a>';
  }

  // ---------- Rendering each question type ----------
  function inputHtml(q) {
    const cur = MQ.ui.cur();
    const pre = q.prefix === '$' ? cur : q.prefix || '';
    switch (q.t) {
      case 'mcq': return '<div class="opts">' + q.options.map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(money(o)) + '</button>').join('') + '</div>';
      case 'tf': return '<div class="opts tf">' + ['True', 'False'].map((o, i) => '<button class="opt" data-i="' + i + '">' + (i ? '❌ ' : '✅ ') + o + '</button>').join('') + '</div>';
      case 'multi': return '<div class="opts">' + q.options.map((o, i) => '<button class="opt check" data-i="' + i + '" aria-pressed="false"><span class="box"></span>' + esc(money(o)) + '</button>').join('') + '</div>';
      case 'num': return '<div class="num-in">' + (pre ? '<span>' + esc(pre) + '</span>' : '') + '<input id="ans" inputmode="decimal" autocomplete="off" placeholder="Your answer" aria-label="Your answer">' + (q.suffix ? '<span>' + esc(q.suffix) + '</span>' : '') + '</div>';
      case 'order': return '<div class="order-built" id="built"><span class="muted small">Tap the items below in the right order</span></div><div class="order-pool">' + q.shown.map((o, i) => '<button class="chip ord" data-i="' + i + '">' + esc(money(o)) + '</button>').join('') + '</div><button class="btn ghost sm" id="undo">↩ Undo</button>';
      case 'match': return '<div class="match">' + q.pairs.map((p, i) => '<label class="match-row"><span>' + esc(money(p[0])) + '</span><select data-i="' + i + '"><option value="">Choose…</option>' + q.choices.map((c, j) => '<option value="' + j + '">' + esc(money(c)) + '</option>').join('') + '</select></label>').join('') + '</div>';
      case 'saq': return '<textarea id="ans" rows="5" placeholder="Write 2–3 sentences in your own words…" aria-label="Your answer"></textarea><p class="hint" id="wc">0 words · aim for at least 15</p>';
    }
  }
  // Wires up inputs; calls ready(bool) when an answer can be checked, and returns a getter for the answer.
  function wire(q, main, ready) {
    if (q.t === 'mcq' || q.t === 'tf') {
      let pick = null;
      $$('.opt', main).forEach(b => b.onclick = () => { pick = +b.dataset.i; $$('.opt', main).forEach(x => x.classList.toggle('sel', x === b)); ready(true); });
      return () => q.t === 'tf' ? (pick === null ? null : pick === 0) : pick;
    }
    if (q.t === 'multi') {
      const set = new Set();
      $$('.opt', main).forEach(b => b.onclick = () => { const i = +b.dataset.i; set.has(i) ? set.delete(i) : set.add(i); b.classList.toggle('sel', set.has(i)); b.setAttribute('aria-pressed', set.has(i)); ready(set.size > 0); });
      return () => Array.from(set);
    }
    if (q.t === 'num') { const inp = $('#ans', main); inp.oninput = () => ready(!isNaN(parseNum(inp.value))); inp.onkeydown = e => { if (e.key === 'Enter' && !$('#check').disabled) $('#check').click(); }; setTimeout(() => inp.focus(), 50); return () => inp.value; }
    if (q.t === 'order') {
      const seq = [];
      const draw = () => {
        $('#built', main).innerHTML = seq.length ? seq.map((i, n) => '<div class="ord-item"><b>' + (n + 1) + '</b>' + esc(money(q.shown[i])) + '</div>').join('') : '<span class="muted small">Tap the items below in the right order</span>';
        $$('.ord', main).forEach(b => b.disabled = seq.indexOf(+b.dataset.i) >= 0);
        ready(seq.length === q.shown.length);
      };
      $$('.ord', main).forEach(b => b.onclick = () => { seq.push(+b.dataset.i); sound('tap'); draw(); });
      $('#undo', main).onclick = () => { seq.pop(); draw(); };
      return () => seq.map(i => q.shown[i]);
    }
    if (q.t === 'match') {
      const sels = $$('select', main);
      sels.forEach(s => s.onchange = () => ready(sels.every(x => x.value)));
      return () => sels.map(s => q.choices[+s.value]);
    }
    if (q.t === 'saq') {
      const ta = $('#ans', main);
      ta.oninput = () => { const w = wordCount(ta.value); $('#wc', main).textContent = w + ' word' + (w === 1 ? '' : 's') + ' · aim for at least 15'; ready(w >= 1); };
      return () => ta.value;
    }
  }
  function correctHtml(q, g, ans) {
    switch (q.t) {
      case 'mcq': return 'Answer: <b>' + esc(money(q.options[q.answer])) + '</b>';
      case 'tf': return 'Answer: <b>' + (q.answer ? 'True' : 'False') + '</b>';
      case 'multi': return 'Correct picks: <b>' + q.answers.map(i => esc(money(q.options[i]))).join(', ') + '</b>';
      case 'num': return 'Answer: <b>' + esc(q.prefix === '$' ? MQ.ui.cur() : q.prefix || '') + (+q.answer).toLocaleString() + (q.suffix ? ' ' + esc(q.suffix) : '') + '</b>';
      case 'order': return 'Right order:<ol class="ans-list">' + q.items.map(i => '<li>' + esc(money(i)) + '</li>').join('') + '</ol>';
      case 'match': return (g.right !== undefined ? g.right + ' of ' + q.pairs.length + ' matched. ' : '') + '<ul class="ans-list">' + q.pairs.map(p => '<li>' + esc(money(p[0])) + ' → <b>' + esc(money(p[1])) + '</b></li>').join('') + '</ul>';
      case 'saq': return (g.short ? '<p>✍️ Write at least a full sentence so your ideas can be marked.</p>' : '') +
        '<ul class="ideas">' + q.ideas.map((idea, i) => '<li class="' + (g.found[i] ? 'hit' : 'miss') + '">' + (g.found[i] ? '✅ ' : '⬜ ') + esc(idea[0]) + '</li>').join('') + '</ul>' +
        '<p class="muted small">Needed ' + (q.needNow || q.need) + ' of ' + q.ideas.length + ' key ideas.</p><div class="model"><b>Model answer</b><p>' + esc(money(q.model)) + '</p></div>';
    }
    return '';
  }
  function markInputs(q, main, g, ans) {
    if (q.t === 'mcq' || q.t === 'tf' || q.t === 'multi') {
      const right = q.t === 'mcq' ? [q.answer] : q.t === 'tf' ? [q.answer ? 0 : 1] : q.answers;
      const picked = q.t === 'multi' ? ans : [q.t === 'tf' ? (ans ? 0 : 1) : ans];
      $$('.opt', main).forEach((x, j) => { x.disabled = true; if (right.indexOf(j) >= 0) x.classList.add('right'); else if (picked.indexOf(j) >= 0) x.classList.add('wrong'); });
    } else $$('input, textarea, select, .ord, #undo', main).forEach(x => x.disabled = true);
  }

  // ---------- The test screen ----------
  MQ.app.route('test', (main, args) => {
    const unit = unitById(args[0]), kind = args[1] === 'quiz' ? 'quiz' : 'test';
    if (!unit || !testable(unit)) { MQ.app.go('#/learn'); return; }
    const S = ST.get();
    const upto = kind === 'quiz' ? quizUpTo(unit) : unit.lessons.length - 1;
    if (!lessonsDone(unit, upto)) { MQ.ui.toast('🔒 Finish the lessons first'); MQ.app.go('#/learn'); return; }
    main.style.setProperty('--c', unit.color);
    const D = MQ.difficulty();
    const title = kind === 'quiz' ? 'Quiz: ' + unit.title : 'Unit test: ' + unit.title;
    const r0 = rec(unit.id, kind);
    const sample = build(unit, kind), types = {};
    sample.forEach(q => types[q.t] = 1);
    main.innerHTML = '<div class="result pop test-intro"><div class="big-emoji">' + (kind === 'quiz' ? '📝' : '🏁') + '</div><h1>' + esc(title) + '</h1>' +
      '<p class="sub">' + (kind === 'quiz' ? 'A quick check on the first lessons of this unit.' : 'Tests your understanding of the whole unit, mixing ideas from every lesson.') + '</p>' +
      '<div class="result-stats"><div><b>' + sample.length + '</b><span>questions</span></div><div><b>' + D.e + '</b><span>' + D.name + '</span></div><div><b>' + (r0 ? Math.round(r0.best * 100) + '%' : '–') + '</b><span>best</span></div></div>' +
      '<div class="type-chips">' + Object.keys(types).map(t => '<span class="chip">' + TYPE_NAMES[t] + '</span>').join('') + '</div>' +
      '<p class="muted small">' + MQ.diff('🌱 Beginner: short answers need fewer key ideas, and you get a hint after each answer.', '⚖️ Standard: a mix of question types with feedback after each answer.', '🔥 Advanced: extra-hard questions, stricter short-answer marking and +25% XP.') + '</p>' +
      '<a class="btn primary block lg" id="go">Start ' + (kind === 'quiz' ? 'quiz' : 'unit test') + '</a><a class="btn ghost block" href="#/learn">Not now</a></div>';
    $('#go').onclick = () => run(sample);

    function run(qs) {
      let i = 0;
      const results = [];
      function frame(inner) {
        main.innerHTML = '<div class="lesson-top"><a href="#/learn" class="x" aria-label="Quit test">✕</a><div class="bar"><i style="width:' + (i / qs.length * 100) + '%"></i></div></div>' + inner;
      }
      function ask() {
        if (i >= qs.length) return finish(results, qs);
        const q = qs[i];
        frame('<div class="quiz pop"><div class="kicker">' + (kind === 'quiz' ? '📝' : '🏁') + ' ' + (i + 1) + ' / ' + qs.length + ' · ' + TYPE_NAMES[q.t] + ((q.lv || 0) >= 3 || q.extra ? ' · 🔥 hard' : '') + '</div><h2>' + esc(money(q.q)) + '</h2>' + inputHtml(q) + '</div>' +
          '<div class="check-bar"><button class="btn primary block" id="check" disabled>Check</button></div>');
        const get = wire(q, main, ok => { $('#check').disabled = !ok; });
        $('#check').onclick = () => {
          const ans = get(), g = grade(q, ans);
          const ok = g.score >= 1, part = g.score > 0 && !ok;
          results.push({ q, score: g.score });
          S.answers.total++; if (ok) S.answers.correct++;
          MQ.adaptive.recordAnswer(q.cat, ok, q.qid, q.t === 'saq' || q.t === 'num' ? 1.5 : undefined);
          ST.save();
          sound(ok ? 'good' : 'bad');
          markInputs(q, main, g, ans);
          const bar = $('.check-bar', main);
          bar.className = 'check-bar ' + (ok ? 'good' : part ? 'part' : 'bad');
          bar.innerHTML = '<div class="fb-text"><b>' + (ok ? 'Correct! ✅' : part ? 'Partly there · ' + Math.round(g.score * 100) + '%' : 'Not quite 🤔') + '</b>' +
            (q.t === 'saq' || q.t === 'order' || q.t === 'match' || !ok ? '<div class="fb-detail">' + correctHtml(q, g, ans) + '</div>' : '') +
            (q.explain && (!ok || D.id === 'easy') ? '<p>' + (D.id === 'easy' ? '💡 ' : '') + esc(money(q.explain)) + '</p>' : '') +
            '</div><button class="btn ' + (ok ? 'primary' : 'danger') + ' block" id="cont">' + (i + 1 < qs.length ? 'Continue' : 'See results') + '</button>';
          $('#cont').onclick = () => { i++; ask(); };
        };
      }
      ask();
    }

    function finish(results, qs) {
      const pts = results.reduce((t, r) => t + r.score, 0), p = pts / qs.length;
      const k = key(unit.id, kind), prev = (S.tests || {})[k];
      const m = masteryOf(p);
      S.tests = S.tests || {};
      S.tests[k] = { best: Math.max(p, prev ? prev.best : 0), last: p, mastery: masteryOf(Math.max(p, prev ? prev.best : 0))[0], date: ST.dateKey(), plays: ((prev && prev.plays) || 0) + 1 };
      ST.save();
      let xp = kind === 'test' ? 20 + Math.round(p * 30) : 10 + Math.round(p * 15);
      if (prev) xp = Math.ceil(xp / 2);
      // Per-type breakdown shows which kinds of question to practise.
      const byType = {};
      results.forEach(r => { const b = byType[r.q.t] = byType[r.q.t] || [0, 0]; b[0] += r.score; b[1]++; });
      const lessonsToReview = unit.lessons.filter(l => results.some(r => r.score < 1 && r.q.l === l.index));
      main.innerHTML = '<div class="result pop"><div class="big-emoji bounce">' + m[1] + '</div><h1>' + (kind === 'quiz' ? 'Quiz' : 'Unit test') + ' complete!</h1><p class="sub">' + esc(unit.title) + ' · <b>' + m[0] + '</b></p>' +
        '<div class="result-stats"><div><b>' + Math.round(p * 100) + '%</b><span>score</span></div><div><b>' + (Math.round(pts * 10) / 10) + '/' + qs.length + '</b><span>points</span></div><div><b>+' + xp + '</b><span>XP</span></div></div>' +
        '<div class="card left"><h3>By question type</h3>' + Object.keys(byType).map(t => { const b = byType[t], f = b[0] / b[1]; return '<div class="unit-prog"><span>' + TYPE_NAMES[t] + '</span><div class="bar"><i style="width:' + (f * 100) + '%"></i></div><b>' + Math.round(b[0] * 10) / 10 + '/' + b[1] + '</b></div>'; }).join('') +
        '<p class="hint">Mastery: 90%+ Mastered · 70%+ Proficient · 50%+ Familiar.' + (prev ? ' Retakes earn half XP; your best score is kept.' : '') + '</p></div>' +
        (lessonsToReview.length ? '<div class="card left"><h3>📖 Worth reviewing</h3>' + lessonsToReview.map(l => '<a class="row-link" href="#/lesson/' + l.id + '">' + l.emoji + ' ' + esc(l.title) + ' ›</a>').join('') + '</div>' : '') +
        '<a class="btn primary block lg" href="#/test/' + unit.id + '/' + kind + '">🔁 Try a new set of questions</a><a class="btn ghost block" href="#/learn">Back to units</a></div>';
      if (p >= 0.7) MQ.ui.confetti();
      MQ.cloud.send('test_results', { unit: unit.id, kind, pct: Math.round(p * 1000) / 1000, questions: qs.length, difficulty: D.id });
      if (kind === 'test' && p >= 0.9) ST.flag('unitMaster');
      if (p === 1) ST.flag('testAce');
      ST.addXP(xp, kind === 'test' ? 'Unit test' : 'Quiz');
      MQ.app.renderHeader();
    }
  });

  MQ.assess = { grade, build, nodeHtml, rec, masteryOf, testable, parseNum, TYPE_NAMES };
})(window.MQ);
