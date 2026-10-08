// Country modes: currency, number format, typical costs for scenarios, and country-specific lessons.
// Facts were checked against official sources in 2025. Rules change, so the app always tells players to verify.
window.MQ = window.MQ || {};

(function (MQ) {
  MQ.COUNTRIES = {
    IN: {
      id: 'IN', flag: '🇮🇳', name: 'India', cur: '₹', locale: 'en-IN', inflation: 5, savingsAPY: 7, cardAPR: 42, loanAPR: 14,
      credit: { name: 'CIBIL score', min: 300, max: 900, good: 750 },
      savingsName: 'savings account / FD', indexName: 'Nifty 50 index fund',
      names: ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Kabir', 'Meera', 'Ishaan', 'Diya', 'Arjun', 'Sara'],
      portfolioStart: 1000000, dataset: 'IN',
      tax: { first: { rate: 0.06, label: 'Provident Fund + professional tax (no income tax below the ₹12 lakh rebate)' }, teen: { rate: 0, label: '' } },
      first: { age: [21, 24], job: ['junior designer', 'software trainee', 'bank associate', 'marketing executive', 'lab assistant'], income: [35000, 60000], rent: [9000, 18000], food: [6000, 9000], transport: [1500, 3500], phone: [300, 700], savings: [10000, 40000] },
      teen: { age: [16, 18], job: ['home tutor', 'café helper', 'freelance video editor', 'event volunteer (paid)'], income: [6000, 12000], rent: [0, 0], food: [1500, 2500], transport: [500, 1200], phone: [200, 400], savings: [2000, 8000] },
      goals: {
        first: [{ e: '💻', name: 'laptop', cost: [55000, 75000] }, { e: '🛵', name: 'scooter', cost: [85000, 110000] }, { e: '✈️', name: 'trip to Goa with friends', cost: [30000, 45000] }],
        teen: [{ e: '📱', name: 'new phone', cost: [15000, 25000] }, { e: '🎧', name: 'gaming setup', cost: [20000, 35000] }, { e: '🎒', name: 'school trip', cost: [12000, 20000] }]
      }
    },
    US: {
      id: 'US', flag: '🇺🇸', name: 'United States', cur: '$', locale: 'en-US', inflation: 3, savingsAPY: 4, cardAPR: 24, loanAPR: 12,
      credit: { name: 'FICO score', min: 300, max: 850, good: 740 },
      savingsName: 'high-yield savings account', indexName: 'S&P 500 index fund',
      names: ['Jordan', 'Maya', 'Tyler', 'Ava', 'Diego', 'Chloe', 'Marcus', 'Lily', 'Ethan', 'Zoe'],
      portfolioStart: 10000, dataset: 'US',
      tax: { first: { rate: 0.2, label: 'Federal + state income tax + FICA (approx.)' }, teen: { rate: 0.08, label: 'FICA + a little federal tax (approx.)' } },
      first: { age: [21, 24], job: ['junior analyst', 'retail supervisor', 'dental assistant', 'IT help-desk tech', 'barista trainer'], income: [2800, 4200], rent: [900, 1600], food: [350, 550], transport: [150, 400], phone: [40, 80], savings: [800, 3000] },
      teen: { age: [16, 18], job: ['grocery bagger', 'lifeguard', 'babysitter', 'fast-food crew'], income: [500, 900], rent: [0, 0], food: [80, 150], transport: [40, 100], phone: [25, 50], savings: [200, 800] },
      goals: {
        first: [{ e: '💻', name: 'laptop', cost: [1000, 1500] }, { e: '🚗', name: 'used-car down payment', cost: [2500, 4000] }, { e: '✈️', name: 'trip with friends', cost: [1200, 2000] }],
        teen: [{ e: '📱', name: 'new phone', cost: [600, 900] }, { e: '🎧', name: 'gaming PC', cost: [900, 1300] }, { e: '🎒', name: 'school trip', cost: [600, 1000] }]
      }
    },
    UK: {
      id: 'UK', flag: '🇬🇧', name: 'United Kingdom', cur: '£', locale: 'en-GB', inflation: 3.5, savingsAPY: 4, cardAPR: 25, loanAPR: 10,
      credit: { name: 'credit score (Experian scale)', min: 0, max: 999, good: 881 },
      savingsName: 'easy-access savings / cash ISA', indexName: 'global index fund',
      names: ['Oliver', 'Amelia', 'Harry', 'Isla', 'Leo', 'Freya', 'Zain', 'Poppy', 'Alfie', 'Maya'],
      portfolioStart: 10000, dataset: 'US',
      tax: { first: { rate: 0.17, label: 'Income tax + National Insurance (approx.)' }, teen: { rate: 0, label: '' } },
      first: { age: [21, 24], job: ['graduate trainee', 'apprentice electrician', 'admin assistant', 'junior developer', 'nursery assistant'], income: [1900, 2800], rent: [650, 1100], food: [200, 320], transport: [80, 180], phone: [12, 25], savings: [500, 2500] },
      teen: { age: [16, 18], job: ['Saturday shop assistant', 'paper round', 'café staff', 'tutor'], income: [350, 650], rent: [0, 0], food: [60, 110], transport: [30, 70], phone: [10, 20], savings: [150, 600] },
      goals: {
        first: [{ e: '💻', name: 'laptop', cost: [800, 1200] }, { e: '🚗', name: 'first car', cost: [2500, 3500] }, { e: '✈️', name: 'festival + trip', cost: [900, 1500] }],
        teen: [{ e: '📱', name: 'new phone', cost: [450, 750] }, { e: '🎧', name: 'gaming setup', cost: [600, 1000] }, { e: '🎒', name: 'school trip', cost: [400, 800] }]
      }
    }
  };
  // "Global" uses US-style numbers but lets the player pick any currency symbol.
  MQ.COUNTRIES.GL = Object.assign({}, MQ.COUNTRIES.US, { id: 'GL', flag: '🌍', name: 'Global / other', cur: null, locale: undefined, credit: { name: 'credit score', min: 300, max: 850, good: 740 }, savingsName: 'savings account', indexName: 'global index fund' });

  MQ.country = function () {
    const S = MQ.state && MQ.state.get();
    return MQ.COUNTRIES[(S && S.settings.country) || 'GL'] || MQ.COUNTRIES.GL;
  };

  // Round to a "nice" human number: 45,312 -> 45,000 ; 1,240 -> 1,200
  MQ.roundNice = function (x) {
    if (!x) return 0;
    const sign = x < 0 ? -1 : 1; x = Math.abs(x);
    const mag = Math.pow(10, Math.floor(Math.log10(x)));
    const step = Math.max(1, mag / 10 * (x / mag < 3 ? 1 : 5));
    return sign * Math.round(x / step) * step;
  };
  MQ.pickRange = function (r, range) { return MQ.roundNice(range[0] + r() * (range[1] - range[0])); };
  MQ.pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };

  // ---------- Country-specific lessons ----------
  const VERIFY = 'Rules and numbers change. Always check the official source before relying on them.';
  MQ.COUNTRY_UNITS = {
    IN: {
      id: 'country-IN', title: 'Money in India', emoji: '🇮🇳', color: '#f97316', blurb: 'UPI, FDs, PPF, CIBIL, tax slabs and SIPs. ' + VERIFY,
      lessons: [
        {
          id: 'in-1', title: 'Banking & UPI', emoji: '🏦', cat: 'saving',
          cards: [
            { emoji: '🧒', title: 'Bank accounts for teens', body: 'Banks offer savings accounts for minors, opened with a parent or guardian. RBI rules let banks allow children aged 10+ to operate their own account, and some payment apps offer teen accounts linked to a parent. Ask your bank what it offers.' },
            { emoji: '📲', title: 'UPI is instant money', body: 'UPI moves money between bank accounts in seconds. Golden rule: <b>you never need your UPI PIN to receive money</b>. A "collect request" asking for your PIN means money is <i>leaving</i> your account.' },
            { emoji: '🔒', title: 'Fixed deposits (FD)', body: 'An <b>FD</b> locks money for a fixed time at a fixed interest rate. Breaking it early usually costs a penalty. A <b>recurring deposit (RD)</b> lets you add a fixed amount every month.' },
            { emoji: '🛡️', title: 'Deposit insurance', body: 'The <b>DICGC</b> insures bank deposits up to <b>₹5 lakh</b> per depositor per bank, including interest. Check rbi.org.in for the latest.' },
            { emoji: '🏛️', title: 'PPF', body: 'The <b>Public Provident Fund</b> is government-backed, has a <b>15-year</b> lock-in and offers tax benefits. Great for long-term, low-risk saving.' }
          ],
          quiz: [
            { q: 'Someone sends a UPI request and says "enter your PIN to receive ₹2,000". What is happening?', options: ['You will receive ₹2,000', 'Money will leave your account. It is a scam', 'UPI is broken', 'You are earning interest'], answer: 1, explain: 'You never need a PIN to receive money on UPI.' },
            { q: 'How much does DICGC insure per depositor per bank?', options: ['₹50,000', '₹1 lakh', '₹5 lakh', 'Unlimited'], answer: 2, explain: 'DICGC insurance covers up to ₹5 lakh, including interest.' },
            { q: 'What is the lock-in period of a PPF account?', options: ['1 year', '5 years', '15 years', 'No lock-in'], answer: 2, explain: 'PPF has a 15-year lock-in, which makes it a long-term product.' },
            { q: 'Which product lets you deposit a fixed amount every month?', options: ['Recurring deposit (RD)', 'Credit card', 'Gold loan', 'Current account'], answer: 0, explain: 'An RD builds the monthly saving habit.' }
          ]
        },
        {
          id: 'in-2', title: 'Tax, CIBIL & SIPs', emoji: '🧾', cat: 'earning',
          cards: [
            { emoji: '🪜', title: 'Income tax slabs', body: 'India taxes income in <b>slabs</b>: higher slices of income get higher rates. Under the new regime for FY 2025-26, income up to <b>₹12 lakh</b> effectively pays no income tax thanks to a rebate (salaried people also get a ₹75,000 standard deduction). Check incometax.gov.in for current rules.' },
            { emoji: '🧾', title: 'GST', body: '<b>GST</b> is a tax on goods and services, usually already included in the price you see.' },
            { emoji: '🔢', title: 'CIBIL score', body: 'Your <b>CIBIL score</b> runs from 300 to 900. Around <b>750+</b> is generally seen as good. Paying EMIs and card bills on time matters most.' },
            { emoji: '📆', title: 'SIPs & index funds', body: 'A <b>SIP</b> invests a fixed amount in a mutual fund every month (dollar-cost averaging, Indian style). A <b>Nifty 50 index fund</b> owns India\'s 50 largest listed companies.' },
            { emoji: '🎓', title: 'Education loans', body: 'Indian education loans usually start charging interest while you study, and repayment begins after a <b>moratorium</b> (course length plus a grace period). Under the old tax regime, the interest can be deducted under <b>Section 80E</b>. Compare interest rates, collateral rules and whether interest is "simple" during study.' },
            { emoji: '🚨', title: 'SEBI & finfluencers', body: '<b>SEBI</b> regulates markets. Before trusting a "stock tips" Telegram group or influencer, check if they are SEBI-registered. Guaranteed returns are a red flag.' }
          ],
          quiz: [
            { q: 'What is a SIP?', options: ['A one-time lottery ticket', 'Investing a fixed amount in a fund every month', 'A type of loan', 'A tax form'], answer: 1, explain: 'SIP = Systematic Investment Plan.' },
            { q: 'What range does a CIBIL score use?', options: ['0–100', '300–900', '1–10', '500–1,000'], answer: 1, explain: 'CIBIL runs from 300 to 900. Around 750+ is generally good.' },
            { q: 'A Telegram group promises "guaranteed 5% daily returns". You should...', options: ['Join quickly', 'Check SEBI registration and avoid guaranteed-return promises', 'Invest your savings', 'Invite friends for bonuses'], answer: 1, explain: 'Guaranteed high returns are a classic scam sign.' },
            { q: 'True or false: in a slab system, crossing into a higher slab means your whole income is taxed at the higher rate.', options: ['True', 'False'], answer: 1, explain: 'Only the income inside the higher slab gets the higher rate.' },
            { q: 'An education loan "moratorium" means...', options: ['The loan is forgiven', 'Repayments start only after your course plus a grace period', 'You pay double interest', 'You cannot study abroad'], answer: 1, explain: 'Interest usually still builds up during the moratorium, so paying some early helps.' }
          ]
        }
      ]
    },
    US: {
      id: 'country-US', title: 'Money in the US', emoji: '🇺🇸', color: '#2563eb', blurb: 'FDIC, FICO, paychecks, Roth IRAs and 401(k)s. ' + VERIFY,
      lessons: [
        {
          id: 'us-1', title: 'Banking & Credit', emoji: '🏦', cat: 'credit',
          cards: [
            { emoji: '🛡️', title: 'FDIC insurance', body: 'Deposits at FDIC-insured banks are protected up to <b>$250,000</b> per depositor, per bank, per ownership category. Check fdic.gov.' },
            { emoji: '🔢', title: 'FICO scores', body: 'Most lenders use <b>FICO</b> scores from 300 to 850. Payment history and how much of your limit you use matter most. Landlords and some employers may check credit too.' },
            { emoji: '💸', title: 'Payment apps = cash', body: 'Zelle, Venmo and Cash App payments are usually instant and hard to reverse. Only send money to people you know in real life.' },
            { emoji: '🏦', title: 'Teen bank accounts', body: 'Under 18, most US banks require a parent or guardian as a joint owner on a checking account. Many teen accounts come with a debit card, spending alerts and no monthly fees.' },
            { emoji: '🧒', title: 'Building credit young', body: 'Being an authorized user on a parent\'s card, or a secured card at 18, can start your credit history. Pay in full, every time.' }
          ],
          quiz: [
            { q: 'FDIC insurance covers up to how much per depositor, per bank, per ownership category?', options: ['$25,000', '$100,000', '$250,000', 'Unlimited'], answer: 2, explain: 'The standard FDIC limit is $250,000.' },
            { q: 'FICO scores range from...', options: ['0–100', '300–850', '300–900', '1–999'], answer: 1, explain: 'FICO uses 300–850.' },
            { q: 'A stranger on Marketplace asks you to pay with Zelle first. Risk?', options: ['None, Zelle is insured', 'High. Payments are like cash and hard to reverse', 'Zelle refunds everything', 'It builds your credit'], answer: 1, explain: 'Treat payment apps like handing over cash.' },
            { q: 'Which matters MOST for a FICO score?', options: ['Your income', 'Payment history', 'Your job title', 'Your bank\'s name'], answer: 1, explain: 'On-time payments are the biggest factor.' }
          ]
        },
        {
          id: 'us-2', title: 'Paychecks & Investing', emoji: '🧾', cat: 'earning',
          cards: [
            { emoji: '✂️', title: 'Where your paycheck goes', body: 'Typical deductions: federal income tax, state income tax (most states) and <b>FICA</b>: Social Security 6.2% + Medicare 1.45% = <b>7.65%</b>. Your W-4 form tells your employer how much federal tax to withhold.' },
            { emoji: '🏷️', title: 'Sales tax', body: 'Sales tax is usually <b>added at checkout</b> and varies by state and city. A $50 shirt can cost $54 at the register.' },
            { emoji: '🌱', title: 'Roth IRA', body: 'If you have earned income, even as a teen (via a custodial account), a <b>Roth IRA</b> lets you invest after-tax money that can grow tax-free for retirement. Check irs.gov for yearly limits.' },
            { emoji: '🎓', title: 'Student loans', body: '<b>Federal</b> student loans have fixed rates set each year and offer options like income-driven repayment. With <b>unsubsidized</b> loans, interest builds up while you are in school. <b>Private</b> loans are usually less flexible. Borrow only what you need: check studentaid.gov.' },
            { emoji: '🎁', title: '401(k) match', body: 'Many employers <b>match</b> part of what you put in a 401(k). Not taking the full match is like refusing free money.' }
          ],
          quiz: [
            { q: 'What does FICA pay for?', options: ['Sales tax', 'Social Security and Medicare', 'Student loans', 'Bank fees'], answer: 1, explain: 'FICA = Social Security (6.2%) + Medicare (1.45%).' },
            { q: 'A $50 item in a state with 8% sales tax costs at checkout...', options: ['$50', '$54', '$58', '$46'], answer: 1, explain: '$50 × 1.08 = $54.' },
            { q: 'Your employer matches 401(k) contributions up to 4%. Not contributing means...', options: ['You save money', 'You give up free money', 'Nothing changes', 'Higher taxes for them'], answer: 1, explain: 'The match is part of your pay. Grab it.' },
            { q: 'True or false: teens with a job can invest in a custodial Roth IRA.', options: ['True', 'False'], answer: 0, explain: 'You need earned income, and an adult opens it with you.' },
            { q: 'With an unsubsidized federal student loan, interest...', options: ['Never starts', 'Builds up while you are still in school', 'Is paid by the government forever', 'Only applies to private loans'], answer: 1, explain: 'Unsubsidized loans accrue interest from day one.' }
          ]
        }
      ]
    },
    UK: {
      id: 'country-UK', title: 'Money in the UK', emoji: '🇬🇧', color: '#7c3aed', blurb: 'FSCS, credit files, tax codes, NI, ISAs and student loans. ' + VERIFY,
      lessons: [
        {
          id: 'uk-1', title: 'Banking & Credit', emoji: '🏦', cat: 'credit',
          cards: [
            { emoji: '🧒', title: 'Teen accounts & Junior ISAs', body: 'Many UK banks offer current accounts from around age 11 with a debit card. A <b>Junior ISA</b> lets family save or invest up to £9,000 a year for you tax-free. The money becomes yours at 18. Check gov.uk for current limits.' },
            { emoji: '🛡️', title: 'FSCS protection', body: 'The <b>FSCS</b> protects deposits if a UK-authorised bank fails, up to <b>£120,000</b> per person per banking licence (raised from £85,000 in December 2025). Check fscs.org.uk.' },
            { emoji: '📂', title: 'Credit files', body: 'Experian, Equifax and TransUnion each keep a credit file on you and each uses its own score scale. Being on the <b>electoral roll</b> and paying on time both help.' },
            { emoji: '⚠️', title: 'Overdrafts', body: 'Arranged overdrafts often charge around <b>40% a year</b>. Handy in an emergency, expensive as a habit.' },
            { emoji: '🛍️', title: 'Buy now, pay later', body: 'BNPL (Klarna, Clearpay…) splits payments. Missed payments can mean fees and can affect your credit file.' }
          ],
          quiz: [
            { q: 'Which helps your UK credit file?', options: ['Being on the electoral roll', 'Missing a phone bill', 'Applying for 5 cards in a week', 'Never having any bank account'], answer: 0, explain: 'Lenders use the electoral roll to confirm who you are.' },
            { q: 'Why avoid living in your overdraft?', options: ['It earns too much interest', 'It often costs around 40% a year', 'It is illegal', 'It closes your account'], answer: 1, explain: 'Overdraft rates are similar to expensive credit cards.' },
            { q: 'True or false: every credit reference agency uses the same score scale.', options: ['True', 'False'], answer: 1, explain: 'Each agency uses its own scale.' },
            { q: 'Missing BNPL payments can...', options: ['Improve your score', 'Lead to fees and hurt your credit file', 'Cancel the purchase for free', 'Nothing'], answer: 1, explain: 'BNPL is still borrowing.' }
          ]
        },
        {
          id: 'uk-2', title: 'Tax, NI & ISAs', emoji: '🧾', cat: 'earning',
          cards: [
            { emoji: '🆓', title: 'Personal Allowance', body: 'Most people can earn <b>£12,570</b> a year tax-free. Above that, income tax starts at 20% (Scotland uses different bands). Your tax code, often <b>1257L</b>, tells your employer this. Check gov.uk.' },
            { emoji: '🧾', title: 'National Insurance', body: 'NI comes out of your pay from age 16 once you earn above a threshold, and builds your right to the State Pension.' },
            { emoji: '🏷️', title: 'VAT is included', body: 'VAT (standard rate 20%) is already in shop prices. What you see is what you pay.' },
            { emoji: '🌳', title: 'ISAs', body: 'An <b>ISA</b> lets savings and investments grow tax-free (£20,000 a year in total; rules for cash ISAs are changing, so check gov.uk). A <b>Lifetime ISA</b> (age 18–39) adds a 25% government bonus for a first home or retirement.' },
            { emoji: '🎓', title: 'Student loans', body: 'You repay a share of income above a threshold, collected through your payslip. It works more like a graduate tax than a normal loan.' }
          ],
          quiz: [
            { q: 'A tax code of 1257L usually means...', options: ['You owe £1,257', 'You get the standard £12,570 Personal Allowance', 'You are a student', 'You pay no NI'], answer: 1, explain: '1257L = £12,570 tax-free allowance.' },
            { q: 'A Lifetime ISA bonus is...', options: ['5%', '10%', '25%', '100%'], answer: 2, explain: 'The government adds 25% to what you put in, up to the yearly limit.' },
            { q: 'Shop price £24 including 20% VAT. Do you pay extra at the till?', options: ['Yes, £4.80 more', 'No, VAT is included', 'Yes, £2 more', 'Only online'], answer: 1, explain: 'UK prices include VAT.' },
            { q: 'UK student loan repayments are based on...', options: ['How much you borrowed', 'Your income above a threshold', 'Your parents\' income', 'A fixed £200/month'], answer: 1, explain: 'You repay a percentage of earnings above the threshold.' }
          ]
        }
      ]
    }
  };
  Object.keys(MQ.COUNTRY_UNITS).forEach(k => {
    const u = MQ.COUNTRY_UNITS[k];
    u.country = k;
    u.lessons.forEach((l, i) => { MQ.LESSONS[l.id] = Object.assign(l, { unitId: u.id, index: i }); });
  });
  MQ.countryUnit = function () { return MQ.COUNTRY_UNITS[MQ.country().id] || null; };
  MQ.visibleUnits = function () { const cu = MQ.countryUnit(); return cu ? MQ.UNITS.concat([cu]) : MQ.UNITS; };
})(window.MQ);
