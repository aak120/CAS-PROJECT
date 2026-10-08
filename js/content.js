// MoneyQuest learning content.
// Amounts are written with "$" and swapped for the player's chosen currency symbol at render time.
window.MQ = window.MQ || {};

MQ.UNITS = [
  {
    id: 'teen', title: 'Teen Money Life', emoji: '🎒', color: '#ec4899',
    blurb: 'Pocket money, gaming, friends and saving up for the big stuff. Start here!',
    lessons: [
      {
        id: 'teen-1', title: 'Pocket Money Power', emoji: '🪙', cat: 'budgeting',
        cards: [
          { emoji: '💼', title: 'Treat it like a salary', body: 'Pocket money, birthday cash and money from small jobs are all <b>income</b>. Managing a small amount well now is exactly the skill you will use with a big salary later.' },
          { emoji: '🤝', title: 'Agree what it covers', body: 'Sit down with your parents or guardians and agree: does your money pay for snacks? Phone top-ups? Outings with friends? Knowing this stops arguments and surprise "I\'m broke" moments.' },
          { emoji: '🫙', title: 'Use three jars', body: 'Split every bit of money into <b>Spend</b>, <b>Save</b> and <b>Give</b> (for example 50% / 40% / 10%). Real jars, separate bank "pots", or a notes app all work.' },
          { emoji: '📈', title: 'Asking for a raise', body: 'Want more pocket money? Show a simple budget of what you spend and what you are saving for. A plan is much more convincing than "everyone else gets more".' }
        ],
        quiz: [
          { q: 'You get $20 a week. Using 50% spend, 40% save, 10% give, how much goes to SAVE?', options: ['$2', '$8', '$10', '$20'], answer: 1, explain: '40% of $20 = $8.' },
          { q: 'What is the best first step before your pocket money starts?', options: ['Spend it fast', 'Agree with your family what it has to cover', 'Ask for double', 'Hide it'], answer: 1, explain: 'Knowing what it covers lets you plan.' },
          { q: 'True or false: birthday money and money from small jobs count as income.', options: ['True', 'False'], answer: 0, explain: 'Any money that comes in is income, even if it is irregular.' },
          { q: 'The most convincing way to ask for more pocket money is...', options: ['Say all your friends get more', 'Show a budget and a savings goal', 'Ask every day', 'Stop doing chores'], answer: 1, explain: 'A plan shows you can handle more.' }
        ]
      },
      {
        id: 'teen-2', title: 'Gaming & Digital Spending', emoji: '🎮', cat: 'budgeting',
        cards: [
          { emoji: '💎', title: 'Fake money, real price', body: 'Gems, coins, V-Bucks, Robux: in-game currency hides the real price. If 1,000 gems cost $10, that "250-gem skin" is really $2.50. Always convert back to real money.' },
          { emoji: '🎁', title: 'Loot boxes are designed like gambling', body: 'Random rewards, flashing animations and "almost got it!" moments keep you paying. You usually spend far more than the item you actually wanted would cost.' },
          { emoji: '🔁', title: 'Battle passes & subscriptions', body: 'A $10 pass every season, plus a gaming subscription, plus a music app adds up fast. List everything that renews automatically and cancel what you do not use.' },
          { emoji: '🛑', title: 'Set a limit before you play', body: 'Decide a monthly gaming budget in advance and use spending limits or parental controls. Never save a parent\'s card in a game without asking.' }
        ],
        quiz: [
          { q: '1,000 gems cost $10. A skin costs 400 gems. What is its real price?', options: ['$0.40', '$4', '$40', '$400'], answer: 1, explain: '400 ÷ 1,000 × $10 = $4.' },
          { q: 'Why are loot boxes risky for your wallet?', options: ['They are always cheap', 'Random rewards make you keep paying to "win"', 'They give you real money', 'They are free'], answer: 1, explain: 'They use the same psychology as slot machines.' },
          { q: 'You pay $10 a month for a game pass, $5 for music and $8 for a season pass. Yearly total?', options: ['$23', '$96', '$276', '$1,000'], answer: 2, explain: '$23 × 12 = $276 a year.' },
          { q: 'True or false: saving a parent\'s card in a game without asking is fine if you only buy a little.', options: ['True', 'False'], answer: 1, explain: 'Always ask. Small purchases add up and trust matters.' }
        ]
      },
      {
        id: 'teen-3', title: 'Friends, FOMO & Money', emoji: '🫂', cat: 'budgeting',
        cards: [
          { emoji: '😬', title: 'FOMO is expensive', body: 'Fear of missing out makes you say yes to every outing, every drop, every trend. It is fine to skip some things: the real friends will still be there next weekend.' },
          { emoji: '🗣️', title: 'How to say no', body: 'Try: <i>"I\'m saving for a new phone, can we do something free instead?"</i> Being honest about a goal sounds confident, not cheap. Suggest a park, a movie night at home or a game session.' },
          { emoji: '🍕', title: 'Splitting the bill fairly', body: 'If you only had a drink, you don\'t have to split a big meal equally. Agree before ordering, or use a split-by-item app. Pay back friends quickly.' },
          { emoji: '📱', title: 'Social media is a highlight reel', body: 'People post the new sneakers, not the empty bank account. Comparing yourself to influencers who are paid to show off is a fast way to overspend.' }
        ],
        quiz: [
          { q: 'Your friends plan an expensive outing but you are saving. A good response is...', options: ['Borrow money to go', 'Say you\'re saving and suggest a cheaper plan', 'Lie that you are sick', 'Never hang out again'], answer: 1, explain: 'Honest and a fun alternative.' },
          { q: 'Five friends share a $50 pizza order, but you only had a $4 drink. What is fair?', options: ['You pay $10', 'You pay for what you had, if agreed upfront', 'You pay $50', 'Nothing'], answer: 1, explain: 'Agree how to split before ordering.' },
          { q: 'True or false: influencers\' posts show what normal life costs.', options: ['True', 'False'], answer: 1, explain: 'Many are sponsored highlight reels.' },
          { q: 'FOMO mostly makes you...', options: ['Save more', 'Spend on things you did not plan', 'Earn more', 'Pay less tax'], answer: 1, explain: 'It pushes unplanned spending.' }
        ]
      },
      {
        id: 'teen-4', title: 'Saving for Something Big', emoji: '🎯', cat: 'saving',
        cards: [
          { emoji: '🕹️', title: 'Pick one clear goal', body: 'A console, a phone, a trip, a bike. Write down the exact item and its price. A clear goal is much easier to save for than "more money".' },
          { emoji: '🧮', title: 'Do the maths', body: 'Weeks needed = price ÷ amount saved per week. A $300 console at $15 a week takes <b>20 weeks</b>. Save $20 a week and it takes 15.' },
          { emoji: '🚀', title: 'Speed it up', body: 'Sell things you no longer use, do extra jobs, ask for money towards your goal instead of gifts, and cut one small habit. Every bit shortens the wait.' },
          { emoji: '⏳', title: 'Delayed gratification', body: 'Waiting for something makes it feel better when you get it, and you often find a better deal or realise you want something else. That patience is a money superpower.' }
        ],
        quiz: [
          { q: 'A $240 bike, saving $12 a week. How many weeks?', options: ['12', '20', '24', '30'], answer: 1, explain: '$240 ÷ $12 = 20 weeks.' },
          { q: 'Which goal is easiest to save for?', options: ['"More money"', '"A $300 console by June"', '"Be rich"', '"Some stuff"'], answer: 1, explain: 'Specific item, price and deadline.' },
          { q: 'Which speeds up reaching your goal?', options: ['Selling things you no longer use', 'Buying snacks daily', 'Loot boxes', 'Waiting for luck'], answer: 0, explain: 'Extra income shortens the wait.' },
          { q: 'True or false: waiting before buying often leads to a better deal.', options: ['True', 'False'], answer: 0, explain: 'Patience lets you compare prices and wait for sales.' }
        ]
      }
    ]
  },
  {
    id: 'basics', title: 'Money Basics', emoji: '💵', color: '#22c55e',
    blurb: 'Needs vs wants, budgeting and where your money actually goes.',
    lessons: [
      {
        id: 'basics-1', title: 'Needs vs Wants', emoji: '🛒',
        cards: [
          { emoji: '🍞', title: 'Needs keep you going', body: 'A <b>need</b> is something you genuinely require to live, learn or work: food, a place to live, basic clothes, getting to school, healthcare.' },
          { emoji: '🎧', title: 'Wants make life fun', body: 'A <b>want</b> is something nice to have but you could live without: concert tickets, a new skin in your favourite game, the third pair of sneakers.' },
          { emoji: '🤔', title: 'The grey zone', body: 'Some things are both. A basic phone can be a need, but upgrading to the newest $1,200 model every year is a want. Ask: <i>"What is the cheapest version that does the job?"</i>' },
          { emoji: '⏳', title: 'The 24-hour rule', body: 'Before buying a want, wait 24 hours. If you still want it tomorrow, go for it. You will be surprised how often the urge disappears.' },
          { emoji: '⚖️', title: 'Opportunity cost', body: 'Every time you spend, you give up something else you could have done with that money. Spending $60 on a game is $60 less towards that $300 bike.' }
        ],
        quiz: [
          { q: 'Which of these is a NEED?', options: ['Concert ticket', 'Groceries for the week', 'New gaming headset', 'Designer sneakers'], answer: 1, explain: 'Food is essential. The others are fun, but you could live without them.' },
          { q: 'True or false: upgrading to the newest phone every year is usually a want.', options: ['True', 'False'], answer: 0, explain: 'A working phone can be a need, but the yearly upgrade is a want.' },
          { q: 'What does the "24-hour rule" mean?', options: ['Shops must give refunds within 24 hours', 'Wait a day before buying a non-essential to see if you still want it', 'Spend your allowance within 24 hours', 'Only shop between midnight and 1am'], answer: 1, explain: 'A short pause beats impulse buying.' },
          { q: 'You spend $60 on a game instead of saving for a $300 bike. What is the opportunity cost?', options: ['$300', 'Nothing, you got a game', '$60 of progress towards the bike', 'The bike gets cheaper'], answer: 2, explain: 'Opportunity cost is what you give up: here, $60 towards your bike goal.' }
        ]
      },
      {
        id: 'basics-2', title: 'Building a Budget', emoji: '📝',
        cards: [
          { emoji: '🗺️', title: 'A budget is a plan', body: 'A <b>budget</b> is a plan for your money: what comes in (<b>income</b>) and what goes out (<b>expenses</b>). It is not a punishment. It tells your money where to go instead of wondering where it went.' },
          { emoji: '➖', title: 'Income − Expenses', body: 'If income is bigger than expenses you have a <b>surplus</b> (yay, save it). If expenses are bigger you have a <b>deficit</b>, and that gap gets filled with debt or by emptying your savings.' },
          { emoji: '🥧', title: 'The 50/30/20 rule', body: 'A simple starting split: <b>50%</b> needs, <b>30%</b> wants, <b>20%</b> savings. If pocket money and a weekend job bring in $200 a month, that is $100 / $60 / $40.' },
          { emoji: '🧑‍🎓', title: 'Teen twist', body: 'If you do not pay rent or bills yet, your "needs" slice is small. That is your superpower: you can save way more than 20% while life is cheap.' }
        ],
        quiz: [
          { q: 'In the 50/30/20 rule, what is the 20% for?', options: ['Wants', 'Savings and debt repayment', 'Rent', 'Taxes'], answer: 1, explain: '50% needs, 30% wants, 20% savings and paying off debt.' },
          { q: 'You get $200 a month from pocket money and a weekend job. Using 50/30/20, how much goes to wants?', options: ['$40', '$60', '$100', '$20'], answer: 1, explain: '30% of $200 = $60.' },
          { q: 'You get $250 this month and spend $280. You have a...', options: ['Surplus of $30', 'Deficit of $30', 'Balanced budget', 'Tax refund'], answer: 1, explain: 'Spending more than you earn is a deficit.' },
          { q: 'True or false: budgets are only for people who are bad with money.', options: ['True', 'False'], answer: 1, explain: 'Most people who are good with money use a budget. That is part of why they are good with it.' }
        ]
      },
      {
        id: 'basics-3', title: 'Spending Leaks', emoji: '💧',
        cards: [
          { emoji: '🧋', title: 'Small leaks sink big ships', body: 'A $5 snack every day feels like nothing. Over a year it is <b>$1,825</b>. Small, frequent spending is where most budgets leak.' },
          { emoji: '🔁', title: 'Sneaky subscriptions', body: 'Streaming, music, game passes, apps... each one is "only" $5–$15 a month. Check your list every few months and cancel what you do not use.' },
          { emoji: '🔎', title: 'Track before you plan', body: 'For one month, write down <b>every</b> purchase (notes app, spreadsheet or budgeting app). Most people are shocked by the result.' },
          { emoji: '✉️', title: 'The envelope method', body: 'Put cash for each category (food, fun, transport) in its own envelope. When the envelope is empty, that category is done for the month. Apps can do digital "envelopes" too.' }
        ],
        quiz: [
          { q: 'Spending $5 a day on snacks adds up to about how much per year?', options: ['$150', '$500', '$1,825', '$5,000'], answer: 2, explain: '$5 × 365 = $1,825.' },
          { q: 'What is the best first step to find your spending leaks?', options: ['Guess', 'Track every purchase for a month', 'Stop buying food', 'Get a credit card'], answer: 1, explain: 'You cannot fix what you cannot see. Tracking shows the real picture.' },
          { q: 'True or false: small purchases cannot really affect your budget.', options: ['True', 'False'], answer: 1, explain: 'Small purchases happen often, so they add up quickly.' },
          { q: 'In the envelope method, what happens when the "fun" envelope is empty?', options: ['Borrow from the "food" envelope', 'Use a credit card', 'No more fun spending until next month', 'Ask for a refund'], answer: 2, explain: 'The empty envelope is the limit. That is what makes it work.' }
        ]
      }
    ]
  },
  {
    id: 'saving', title: 'Saving & Banking', emoji: '🏦', color: '#3b82f6',
    blurb: 'Emergency funds, bank accounts and the magic of compound interest.',
    lessons: [
      {
        id: 'saving-1', title: 'Why Save?', emoji: '🐷',
        cards: [
          { emoji: '🥇', title: 'Pay yourself first', body: 'When money comes in, move your savings out <b>first</b>, before you spend. Whatever is left is yours to spend guilt-free.' },
          { emoji: '🧯', title: 'Emergency fund', body: 'Life throws surprises: a cracked phone, a lost bus pass. An <b>emergency fund</b> is money set aside just for these, so a surprise does not turn into debt. Adults aim for 3–6 months of expenses; for teens, even $100–$300 is a great start.' },
          { emoji: '🎯', title: 'SMART goals', body: '"Save more" is vague. "Save $600 for a laptop by June by putting away $75 a month" is <b>S</b>pecific, <b>M</b>easurable, <b>A</b>chievable, <b>R</b>elevant and <b>T</b>ime-bound.' },
          { emoji: '🧭', title: 'Short vs long term', body: 'Short-term goals (weeks to months): concert, gift. Long-term goals (years): car, university, investing. Keep money for each separate so you do not accidentally spend your long-term money.' }
        ],
        quiz: [
          { q: '"Pay yourself first" means...', options: ['Buy yourself a treat on payday', 'Move money into savings before spending', 'Pay your friends back first', 'Skip paying bills'], answer: 1, explain: 'Savings come off the top, not from whatever is left over.' },
          { q: 'What is an emergency fund for?', options: ['Concert tickets', 'Unexpected costs like a broken phone', 'Investing in crypto', 'Holiday shopping'], answer: 1, explain: 'It is for surprises, so they do not become debt.' },
          { q: 'Which goal is the most SMART?', options: ['Save more money', 'Be rich someday', 'Save $600 for a laptop by June with $75/month', 'Spend less, maybe'], answer: 2, explain: 'It is specific, measurable and has a deadline.' },
          { q: 'True or false: you should keep short-term and long-term savings separate.', options: ['True', 'False'], answer: 0, explain: 'Separating them stops you raiding your long-term goals.' }
        ]
      },
      {
        id: 'saving-2', title: 'Banks & Accounts', emoji: '💳',
        cards: [
          { emoji: '🧾', title: 'Current / checking account', body: 'Your everyday account. Your pay goes in, you spend from it with a <b>debit card</b>. Money leaves straight from your account.' },
          { emoji: '🌱', title: 'Savings account', body: 'A separate account that pays you <b>interest</b>, a small reward from the bank for keeping your money there. Look for a good interest rate and no monthly fees.' },
          { emoji: '🧒', title: 'Accounts for teens', body: 'Many banks offer accounts for under-18s, usually opened with a parent or guardian. They often come with a debit card, spending limits and an app to track every purchase. Ask an adult to help you compare them.' },
          { emoji: '🛡️', title: 'Is my money safe?', body: 'In many countries, government schemes protect bank deposits up to a limit if a bank fails (for example FDIC in the US). Money under your mattress has no such protection and earns zero interest.' },
          { emoji: '⚠️', title: 'Debit vs credit', body: '<b>Debit card</b> = your own money. <b>Credit card</b> = the bank\'s money that you must pay back, often with high interest if you do not pay in full.' }
        ],
        quiz: [
          { q: 'Where does money come from when you pay with a debit card?', options: ['The bank\'s money', 'Straight from your own account', 'The shop', 'Your future paycheck'], answer: 1, explain: 'Debit cards spend your own money directly.' },
          { q: 'Why keep savings in a savings account instead of under the mattress?', options: ['It earns interest and is protected', 'It is harder to see', 'Banks pay you to spend', 'There is no reason'], answer: 0, explain: 'Interest plus deposit protection beats a mattress.' },
          { q: 'True or false: a credit card lets you spend the bank\'s money, which you must pay back.', options: ['True', 'False'], answer: 0, explain: 'Credit is borrowing. Pay it back in full to avoid interest.' },
          { q: 'Who usually helps a 15-year-old open a bank account?', options: ['Nobody, it is not allowed', 'A parent or guardian', 'A friend', 'Their teacher'], answer: 1, explain: 'Most teen accounts are opened with a parent or guardian.' },
          { q: 'What should you look for in a savings account?', options: ['High fees', 'A good interest rate and low or no fees', 'A cool card design', 'The longest name'], answer: 1, explain: 'Fees eat your interest. Compare rates.' }
        ]
      },
      {
        id: 'saving-3', title: 'Compound Interest', emoji: '✨',
        cards: [
          { emoji: '➕', title: 'Simple interest', body: 'Interest only on what you put in. $1,000 at 5% earns $50 every year, forever.' },
          { emoji: '❄️', title: 'Compound interest', body: 'Interest on your money <b>and</b> on your past interest. $1,000 at 5%: year 1 → $1,050, year 2 → $1,102.50, and it snowballs from there.' },
          { emoji: '7️⃣2️⃣', title: 'The Rule of 72', body: 'Divide 72 by the interest rate to estimate how many years it takes to double your money. At 6%: 72 ÷ 6 ≈ <b>12 years</b>. At 8%: about 9 years.' },
          { emoji: '⏰', title: 'Time is your superpower', body: 'Someone who starts saving at 15 usually ends up with far more than someone who starts at 25, even if they put in the same monthly amount, because their money has 10 extra years to snowball.' }
        ],
        quiz: [
          { q: '$100 earns 10% compound interest per year. How much after 2 years?', options: ['$120', '$121', '$110', '$200'], answer: 1, explain: '$100 → $110 → $121. Year 2 earns interest on the $10 interest too.' },
          { q: 'Using the Rule of 72, how long to double money at 8%?', options: ['About 4 years', 'About 9 years', 'About 18 years', 'About 72 years'], answer: 1, explain: '72 ÷ 8 = 9 years.' },
          { q: 'True or false: compound interest means earning interest on your interest.', options: ['True', 'False'], answer: 0, explain: 'That snowball effect is what makes it powerful.' },
          { q: 'Two friends save the same amount monthly until 65. Who likely ends with more?', options: ['The one who starts at 25', 'The one who starts at 15', 'They end up equal', 'Whoever has the nicer bank'], answer: 1, explain: 'Ten extra years of compounding makes a big difference.' }
        ]
      }
    ]
  },
  {
    id: 'earning', title: 'Earning & Taxes', emoji: '💼', color: '#f59e0b',
    blurb: 'Paychecks, taxes and ways to earn as a teen.',
    lessons: [
      {
        id: 'earning-1', title: 'Your First Payslip', emoji: '🧾',
        cards: [
          { emoji: '🧒', title: 'Your first job', body: 'Babysitting, tutoring, a café shift or a Saturday shop job: your first pay often comes as a teen. Check the local rules on age, hours and minimum wage for young workers.' },
          { emoji: '💰', title: 'Gross pay', body: '<b>Gross pay</b> is what you earn before anything is taken out. 15 hours × $12/hour = $180 gross.' },
          { emoji: '✂️', title: 'Deductions', body: 'Before money reaches you, some is taken out: <b>income tax</b>, social security or national insurance, sometimes pension contributions. These are <b>deductions</b>.' },
          { emoji: '🏁', title: 'Net pay', body: '<b>Net pay</b> (take-home pay) is what actually lands in your account. Always budget with net pay, not gross.' },
          { emoji: '📄', title: 'Read your payslip', body: 'Check hours, hourly rate and deductions each time. Mistakes happen, and it is your money.' }
        ],
        quiz: [
          { q: 'You work 15 hours at $12/hour. What is your gross pay?', options: ['$12', '$150', '$180', '$27'], answer: 2, explain: '15 × $12 = $180.' },
          { q: 'Net pay is...', options: ['Pay before deductions', 'What you take home after deductions', 'Your yearly bonus', 'Money from fishing'], answer: 1, explain: 'Net = gross minus deductions.' },
          { q: 'Which amount should you build your budget around?', options: ['Gross pay', 'Net pay', 'The amount you hope to get', 'Your friend\'s pay'], answer: 1, explain: 'Net pay is the money you actually have.' },
          { q: 'True or false: the hourly rate on a job ad is exactly what lands in your bank.', options: ['True', 'False'], answer: 1, explain: 'Deductions usually come out first.' }
        ]
      },
      {
        id: 'earning-2', title: 'Taxes You Already Pay', emoji: '🏛️',
        cards: [
          { emoji: '🧋', title: 'You already pay tax!', body: 'Every time you buy a snack, a game or a phone top-up, <b>sales tax / VAT / GST</b> is usually part of the price. Income tax comes later, once you earn above a yearly threshold, which most teens do not reach.' },
          { emoji: '🛣️', title: 'What taxes pay for', body: 'Roads, schools, hospitals, parks, emergency services. Taxes are how a society pays for things everyone shares.' },
          { emoji: '🧮', title: 'Types of tax', body: '<b>Income tax</b> on what you earn. <b>Sales tax / VAT / GST</b> on what you buy. <b>Property tax</b> on homes and land.' },
          { emoji: '🪜', title: 'Tax brackets', body: 'Many countries use <b>progressive</b> tax: higher income is taxed at higher rates, but only the part of income <i>inside</i> each bracket. A raise never makes you take home less overall.' },
          { emoji: '🙅', title: 'Myth busted', body: '"I got a raise into a higher bracket so all my money is taxed more" is <b>false</b>. Only the extra money above the line gets the higher rate.' }
        ],
        quiz: [
          { q: 'Most teens already pay which tax?', options: ['Income tax on pocket money', 'Sales tax / VAT / GST on things they buy', 'Property tax', 'No tax at all'], answer: 1, explain: 'It is included in (or added to) the price of most purchases.' },
          { q: 'Sales tax / VAT is charged on...', options: ['Your income', 'Things you buy', 'Your house', 'Your savings only'], answer: 1, explain: 'It is added to purchases.' },
          { q: 'True or false: moving into a higher tax bracket means ALL your income is taxed at the higher rate.', options: ['True', 'False'], answer: 1, explain: 'Only the income above the threshold gets the higher rate.' },
          { q: 'Which of these is usually funded by taxes?', options: ['Public schools and roads', 'Your streaming subscription', 'Your friend\'s birthday party', 'Video game skins'], answer: 0, explain: 'Taxes fund shared public services.' },
          { q: 'In a progressive system, people with higher incomes...', options: ['Pay a lower rate', 'Pay higher rates on the higher parts of their income', 'Pay no tax', 'Pay the same total amount as everyone'], answer: 1, explain: 'Rates rise in steps as income rises.' }
        ]
      },
      {
        id: 'earning-3', title: 'Ways to Earn', emoji: '🚀',
        cards: [
          { emoji: '☕', title: 'Part-time jobs', body: 'Retail, cafés, lifeguarding, babysitting. Check your local laws on working age, hours and minimum wage.' },
          { emoji: '🧠', title: 'Sell a skill', body: 'Tutoring, editing videos, designing logos, walking dogs, coding simple websites. Skills can earn more per hour than many entry-level jobs.' },
          { emoji: '🧺', title: 'Side hustle math', body: 'Selling bracelets for $10 sounds great, but if the materials cost $6 your <b>profit</b> is only $4. Profit = revenue − costs.' },
          { emoji: '🌙', title: 'Active vs passive', body: '<b>Active income</b> needs your time (a job). <b>Passive income</b> keeps coming with little ongoing work (interest, dividends). Be wary of anyone selling "easy passive income" courses.' }
        ],
        quiz: [
          { q: 'You sell bracelets for $10 each. Materials cost $6 each. Profit per bracelet?', options: ['$10', '$16', '$4', '$6'], answer: 2, explain: 'Profit = $10 − $6 = $4.' },
          { q: 'Which is an example of passive income?', options: ['Working a café shift', 'Interest from a savings account', 'Babysitting', 'Mowing lawns'], answer: 1, explain: 'Interest arrives without you working for it.' },
          { q: 'True or false: an influencer selling a $500 "get rich with passive income" course is a reliable way to get rich.', options: ['True', 'False'], answer: 1, explain: 'Usually the only person getting rich is the one selling the course.' },
          { q: 'Before taking a part-time job, it is smart to check...', options: ['Local laws on age, hours and minimum wage', 'Nothing', 'Only the uniform colour', 'Your horoscope'], answer: 0, explain: 'Knowing your rights protects you.' }
        ]
      }
    ]
  },
  {
    id: 'credit', title: 'Credit & Debt', emoji: '💳', color: '#ef4444',
    blurb: 'Borrowing, credit cards, interest traps and credit scores.',
    lessons: [
      {
        id: 'credit-1', title: 'Borrowing 101', emoji: '🤝',
        cards: [
          { emoji: '🧑‍🤝‍🧑', title: 'Borrowing from friends & family', body: 'Most teen borrowing is from friends or parents. Agree the amount and the payback date, write it down, and pay back on time. Unpaid money is one of the fastest ways to damage a friendship.' },
          { emoji: '📥', title: 'What is debt?', body: '<b>Debt</b> is borrowed money you have to pay back, usually with <b>interest</b> (the cost of borrowing).' },
          { emoji: '📊', title: 'APR', body: 'The <b>APR</b> (annual percentage rate) shows the yearly cost of borrowing. A higher APR means a more expensive loan.' },
          { emoji: '🎓', title: 'Helpful vs harmful debt', body: 'Some debt can help you build value, like a sensible student or business loan. High-interest debt for things that lose value fast (gadgets, clothes, nights out) usually makes you poorer.' },
          { emoji: '🛍️', title: 'Buy Now, Pay Later', body: 'BNPL splits a purchase into instalments. It feels free, but late fees add up and it makes overspending very easy. It is still debt.' }
        ],
        quiz: [
          { q: 'Interest on a loan is...', options: ['A free gift', 'The cost of borrowing money', 'A type of tax', 'Your credit score'], answer: 1, explain: 'Lenders charge interest for letting you use their money.' },
          { q: 'Which loan is more expensive?', options: ['5% APR', '25% APR', 'They are the same', 'Depends on the colour of the card'], answer: 1, explain: 'Higher APR means more interest paid.' },
          { q: 'True or false: Buy Now, Pay Later is not really debt.', options: ['True', 'False'], answer: 1, explain: 'You owe money you have not paid yet. That is debt.' },
          { q: 'You borrow $20 from a friend. The best way to handle it is...', options: ['Forget about it', 'Agree a payback date and stick to it', 'Pay it back in a year', 'Borrow more to pay it back'], answer: 1, explain: 'Clear dates keep money and friendships healthy.' },
          { q: 'Which is most likely "harmful" debt?', options: ['A low-rate student loan for a useful degree', 'High-interest credit card debt for a night out', 'A mortgage you can afford', 'A small business loan with a plan'], answer: 1, explain: 'High interest plus something with no lasting value is a bad combo.' }
        ]
      },
      {
        id: 'credit-2', title: 'Credit Cards (Future You)', emoji: '🪤',
        cards: [
          { emoji: '🔞', title: 'Coming at 18', body: 'In most countries you need to be 18 to get your own credit card. Learn how they work now, so the first card offer you get does not catch you out.' },
          { emoji: '🗓️', title: 'How credit cards work', body: 'You spend now and get a bill later. Pay the <b>full balance</b> by the due date and you usually pay <b>no interest</b>.' },
          { emoji: '🐌', title: 'The minimum payment', body: 'Your bill shows a small "minimum payment". Pay only that and the rest of the balance starts collecting interest, often around 20% APR or more.' },
          { emoji: '😱', title: 'Real numbers', body: 'Owe $1,000 at 20% APR and pay $25 a month? It takes over <b>5 years</b> to clear and costs about <b>$650 in interest</b>.' },
          { emoji: '✅', title: 'Golden rule', body: 'Only put on a credit card what you could pay for with cash today, and pay the full balance every month.' }
        ],
        quiz: [
          { q: 'How do you usually avoid paying interest on a credit card?', options: ['Pay the minimum', 'Pay the full balance by the due date', 'Never look at the bill', 'Get a second card'], answer: 1, explain: 'Paying in full means no interest on purchases.' },
          { q: 'Paying only the minimum on $1,000 at 20% APR ($25/month) takes roughly...', options: ['2 months', '1 year', 'Over 5 years', 'It never gets paid'], answer: 2, explain: 'Interest keeps eating your payments, so it drags on for years.' },
          { q: 'True or false: the minimum payment is designed to help you get out of debt fast.', options: ['True', 'False'], answer: 1, explain: 'Minimum payments keep you in debt longer, and that earns the lender more interest.' },
          { q: 'The golden rule for credit cards is...', options: ['Max it out for points', 'Only spend what you could pay in cash and pay in full', 'Pay the minimum forever', 'Use it for emergencies only, never pay it off'], answer: 1, explain: 'Treat it like a debit card and you get the perks without the cost.' }
        ]
      },
      {
        id: 'credit-3', title: 'Credit Scores', emoji: '📈',
        cards: [
          { emoji: '🔢', title: 'What is a credit score?', body: 'From around 18, you start building a credit history. A credit score is a number lenders use to judge how likely you are to repay. It can affect loans, renting a flat and even some phone contracts. Many countries use credit reports or scores in some form.' },
          { emoji: '⏱️', title: 'Payment history matters most', body: 'Paying on time, every time, is the biggest factor. Even one missed payment can hurt.' },
          { emoji: '🥛', title: 'Credit utilization', body: 'How much of your credit limit you use. Using $900 of a $1,000 limit (90%) looks risky. Keeping it under about 30% looks responsible.' },
          { emoji: '🌳', title: 'Time & mix', body: 'A longer history helps, and so does a mix of credit types. Opening lots of new accounts quickly can lower your score.' }
        ],
        quiz: [
          { q: 'What is the biggest factor in most credit scores?', options: ['Your favourite colour', 'Paying on time', 'Your salary', 'How many cards look cool'], answer: 1, explain: 'Payment history is king.' },
          { q: 'Your limit is $1,000. Which balance looks best for utilization?', options: ['$950', '$800', '$200', '$1,000'], answer: 2, explain: '$200 is 20%, under the ~30% guideline.' },
          { q: 'True or false: opening many credit accounts at once can lower your score.', options: ['True', 'False'], answer: 0, explain: 'Lots of new applications looks risky to lenders.' },
          { q: 'A good credit score can help you...', options: ['Get lower interest rates on loans', 'Skip paying taxes', 'Win the lottery', 'Avoid all bills'], answer: 0, explain: 'Lenders offer better rates to reliable borrowers.' }
        ]
      }
    ]
  },
  {
    id: 'investing', title: 'Investing', emoji: '📈', color: '#8b5cf6',
    blurb: 'Risk, return, stocks, bonds, funds and playing the long game.',
    lessons: [
      {
        id: 'investing-1', title: 'Risk & Return', emoji: '🎢',
        cards: [
          { emoji: '🪴', title: 'Saving vs investing', body: '<b>Saving</b> keeps money safe for short-term goals. <b>Investing</b> puts money into things that can grow over the long term, but can also lose value.' },
          { emoji: '⚖️', title: 'Risk and return go together', body: 'Higher potential returns come with higher risk. Anything promising high returns with "no risk" is a red flag.' },
          { emoji: '🎈', title: 'Inflation', body: 'Prices rise over time. At 3% inflation, $100 buys only about $74 of today\'s stuff after 10 years. Cash that just sits there slowly loses buying power.' },
          { emoji: '🔭', title: 'Time horizon', body: 'Money you need in a year should not be in risky investments. Money you will not touch for 10+ years has time to recover from dips.' }
        ],
        quiz: [
          { q: 'Generally, investments with higher potential returns have...', options: ['Lower risk', 'Higher risk', 'No risk', 'Guaranteed profits'], answer: 1, explain: 'Risk and return are linked.' },
          { q: 'What does inflation do to cash over time?', options: ['Makes it worth more', 'Reduces what it can buy', 'Nothing', 'Turns it into gold'], answer: 1, explain: 'Rising prices erode buying power.' },
          { q: 'True or false: money you need next month should go into risky investments.', options: ['True', 'False'], answer: 1, explain: 'Short-term money belongs somewhere safe.' },
          { q: 'Someone promises "20% per month, zero risk". This is most likely...', options: ['A great deal', 'A scam', 'A savings account', 'Normal investing'], answer: 1, explain: 'High returns with no risk do not exist.' }
        ]
      },
      {
        id: 'investing-2', title: 'Stocks, Bonds & Funds', emoji: '🧺',
        cards: [
          { emoji: '🧩', title: 'Stocks', body: 'A <b>stock</b> (or share) is a small piece of ownership in a company. If the company grows, your share can be worth more. Some companies also pay <b>dividends</b>.' },
          { emoji: '📜', title: 'Bonds', body: 'A <b>bond</b> is a loan you give to a company or government. They pay you interest and return your money later. Usually less risky than stocks, with lower expected returns.' },
          { emoji: '🧺', title: 'Funds & ETFs', body: 'A <b>fund</b> pools many people\'s money to buy lots of investments at once. An <b>index fund</b> tracks a whole market (like the 500 biggest US companies) for a low fee.' },
          { emoji: '🧒', title: 'Can teens invest?', body: 'Usually yes, through an account a parent or guardian opens for you (often called a custodial, junior or minor account). Even small amounts invested at 15 have decades to grow.' },
          { emoji: '🎰', title: 'Investing is not gambling', body: 'Buying a broad slice of the economy and holding for years is very different from betting on one hyped stock or coin to "moon" next week.' }
        ],
        quiz: [
          { q: 'Owning a stock means...', options: ['You lent money to a company', 'You own a small part of a company', 'You work for the company', 'You get free products'], answer: 1, explain: 'Stocks are ownership; bonds are loans.' },
          { q: 'A bond is...', options: ['A share of ownership', 'A loan to a company or government', 'A type of savings app', 'A cryptocurrency'], answer: 1, explain: 'You are the lender, and they pay you interest.' },
          { q: 'An index fund...', options: ['Buys one hot stock', 'Tracks a whole market with many companies', 'Guarantees profits', 'Is a bank account'], answer: 1, explain: 'It spreads money across a whole market.' },
          { q: 'How can most 15-year-olds start investing?', options: ['They cannot', 'Through an account opened with a parent or guardian', 'Only with a credit card', 'By trading options alone'], answer: 1, explain: 'Custodial or junior accounts let adults invest on your behalf.' },
          { q: 'True or false: stocks are usually riskier than bonds.', options: ['True', 'False'], answer: 0, explain: 'Stocks swing more but have higher expected long-term returns.' }
        ]
      },
      {
        id: 'investing-3', title: 'Diversification', emoji: '🥚',
        cards: [
          { emoji: '🧺', title: 'Do not put all your eggs in one basket', body: 'If you own just one company and it crashes, you lose big. Owning many different investments means one bad apple will not ruin you. That is <b>diversification</b>.' },
          { emoji: '⏳', title: 'Time in the market', body: 'Nobody can reliably predict the next dip. Historically, staying invested for the long term has worked better than trying to jump in and out.' },
          { emoji: '😨', title: 'Panic selling', body: 'Markets drop sometimes. Selling in a panic locks in losses. Long-term investors expect dips and stick to the plan.' },
          { emoji: '🧾', title: 'Fees matter', body: 'A 1% yearly fee sounds tiny, but over decades it can eat a big chunk of your growth. Low-cost funds keep more money working for you.' },
          { emoji: '📆', title: 'Dollar-cost averaging', body: 'Invest a fixed amount on a regular schedule (like $50 every month). You buy more when prices are low and less when they are high, and you never have to guess the "perfect" moment.' }
        ],
        quiz: [
          { q: 'Diversification means...', options: ['Putting all money in one stock', 'Spreading money across many investments', 'Keeping everything in cash', 'Selling when prices drop'], answer: 1, explain: 'Spreading out reduces the damage from any single loss.' },
          { q: 'The market drops 15% this month. A long-term investor should usually...', options: ['Panic sell everything', 'Stick to their plan', 'Borrow money to gamble', 'Delete the app forever'], answer: 1, explain: 'Dips are normal. Panic selling locks in losses.' },
          { q: 'Investing $50 every month no matter the price is called...', options: ['Day trading', 'Dollar-cost averaging', 'Market timing', 'Short selling'], answer: 1, explain: 'Regular fixed investing smooths out the bumps.' },
          { q: 'True or false: a 1% yearly fee makes no difference over 40 years.', options: ['True', 'False'], answer: 1, explain: 'Fees compound too, and they can cost a lot over decades.' }
        ]
      }
    ]
  },
  {
    id: 'safety', title: 'Money Safety', emoji: '🛡️', color: '#14b8a6',
    blurb: 'Scams, account security and not falling for hype.',
    lessons: [
      {
        id: 'safety-1', title: 'Spotting Scams', emoji: '🕵️',
        cards: [
          { emoji: '🚩', title: 'Red flag #1: Urgency', body: '"Act NOW or your account will be closed!" Scammers rush you so you do not stop and think.' },
          { emoji: '🎁', title: 'Red flag #2: Too good to be true', body: 'Free money, prizes you did not enter, guaranteed 10x returns. If it sounds too good to be true, it is.' },
          { emoji: '🎫', title: 'Red flag #3: Weird payment methods', body: 'Real organizations do not ask you to pay with gift cards, crypto or wire transfers to strangers.' },
          { emoji: '🔗', title: 'Red flag #4: Strange links', body: 'Check the sender and the link. "paypa1-secure-login.xyz" is not PayPal. When in doubt, open the official app yourself instead of clicking.' }
        ],
        quiz: [
          { q: 'A text says "Your account will be closed in 1 hour! Click here." What is the red flag?', options: ['It is polite', 'Urgency pressure', 'It has good grammar', 'Nothing'], answer: 1, explain: 'Fake urgency is a classic scam tactic.' },
          { q: 'The "tax office" calls and asks you to pay with gift cards. You should...', options: ['Buy the gift cards', 'Hang up. Real agencies never ask for gift cards', 'Give them your bank PIN', 'Pay half'], answer: 1, explain: 'Gift card payment requests are always a scam.' },
          { q: 'True or false: "paypa1-login.xyz" is a safe official link.', options: ['True', 'False'], answer: 1, explain: 'Lookalike domains are a phishing trick.' },
          { q: 'The safest way to check a suspicious message from your bank is...', options: ['Click the link in the message', 'Open the official app or call the number on your card', 'Reply with your password', 'Forward it to friends'], answer: 1, explain: 'Go to the source yourself, not through the message.' }
        ]
      },
      {
        id: 'safety-2', title: 'Protecting Your Accounts', emoji: '🔐',
        cards: [
          { emoji: '🔑', title: 'Strong, unique passwords', body: 'Use long passphrases and a different password for each account. A password manager helps you remember them.' },
          { emoji: '📲', title: 'Turn on 2FA', body: '<b>Two-factor authentication</b> adds a second check, like a code on your phone. Even if someone steals your password, they cannot get in.' },
          { emoji: '🤐', title: 'Never share codes', body: 'Your bank will <b>never</b> ask for your PIN, password or one-time code. Anyone who does is a scammer, even if they sound official.' },
          { emoji: '👀', title: 'Check your statements', body: 'Look over your account activity regularly. Spot a payment you do not recognise? Tell your bank right away.' }
        ],
        quiz: [
          { q: 'What does 2FA add?', options: ['A second password hint', 'A second verification step, like a phone code', 'Two bank accounts', 'Double interest'], answer: 1, explain: 'It stops thieves who only have your password.' },
          { q: 'Someone claiming to be your bank asks for your one-time code. You...', options: ['Read it out', 'Refuse. Banks never ask for it', 'Text it to them', 'Post it online'], answer: 1, explain: 'One-time codes are for you only.' },
          { q: 'True or false: using the same password everywhere is fine if it is long.', options: ['True', 'False'], answer: 1, explain: 'One leak would unlock every account.' },
          { q: 'You see a $49 charge you did not make. Best move?', options: ['Ignore it', 'Contact your bank immediately', 'Wait a year', 'Close your eyes'], answer: 1, explain: 'Acting fast limits the damage and helps you get your money back.' }
        ]
      },
      {
        id: 'safety-3', title: 'Hype & Smart Shopping', emoji: '📣',
        cards: [
          { emoji: '🤳', title: 'Influencers get paid', body: 'Many posts are <b>sponsored</b>. The creator is paid to make you want something. Look for "ad" or "#sponsored" labels.' },
          { emoji: '😬', title: 'FOMO is a sales tool', body: '"Only 2 left!" "Sale ends tonight!" Fear of missing out pushes impulse buys. Use the 24-hour rule.' },
          { emoji: '⚖️', title: 'Compare unit prices', body: 'A big pack is not always cheaper. Compare the price per item, per gram or per ml.' },
          { emoji: '🎰', title: 'Loot boxes & micro-purchases', body: 'Random rewards in games are designed to feel like gambling. Set a monthly limit for in-game spending, or skip them entirely.' }
        ],
        quiz: [
          { q: 'Pack A: 10 cookies for $4. Pack B: 25 cookies for $9. Which is cheaper per cookie?', options: ['Pack A ($0.40 each)', 'Pack B ($0.36 each)', 'Same', 'Cannot tell'], answer: 1, explain: '$9 ÷ 25 = $0.36 per cookie, versus $0.40 for Pack A.' },
          { q: '"Only 2 left in stock!" is mainly designed to...', options: ['Help you budget', 'Create urgency and FOMO', 'Inform the warehouse', 'Lower prices'], answer: 1, explain: 'Scarcity messages push quick decisions.' },
          { q: 'True or false: if an influencer uses a product, it must be the best one.', options: ['True', 'False'], answer: 1, explain: 'They may be paid to promote it.' },
          { q: 'A good strategy for in-game purchases is...', options: ['No limit', 'Set a monthly spending limit', 'Use a parent\'s card secretly', 'Buy every loot box'], answer: 1, explain: 'A limit keeps fun from turning into a money leak.' }
        ]
      }
    ]
  }
];

// Flat lookups
MQ.LESSONS = {};
MQ.UNITS.forEach(u => u.lessons.forEach((l, i) => { MQ.LESSONS[l.id] = Object.assign(l, { unitId: u.id, index: i }); }));
MQ.ALL_QUESTIONS = [];
MQ.UNITS.forEach(u => u.lessons.forEach(l => l.quiz.forEach(q => MQ.ALL_QUESTIONS.push(Object.assign({ lessonId: l.id }, q)))));

// ---------- Games data ----------
MQ.NEEDS_WANTS = [
  { t: 'Groceries', e: '🥦', need: true }, { t: 'School lunch', e: '🥪', need: true }, { t: 'School uniform', e: '👔', need: true },
  { t: 'School supplies', e: '✏️', need: true }, { t: 'Bus pass to school', e: '🚌', need: true }, { t: 'Doctor\'s visit', e: '🩺', need: true },
  { t: 'Winter coat', e: '🧥', need: true }, { t: 'Medicine', e: '💊', need: true }, { t: 'Exam fees', e: '📝', need: true },
  { t: 'Toothpaste', e: '🪥', need: true }, { t: 'Basic school shoes', e: '👞', need: true }, { t: 'Home internet for homework', e: '🌐', need: true },
  { t: 'Concert tickets', e: '🎤', need: false }, { t: 'Game skin', e: '🎮', need: false }, { t: 'Designer hoodie', e: '👕', need: false },
  { t: 'Movie night', e: '🍿', need: false }, { t: 'Bubble tea', e: '🧋', need: false }, { t: 'Third streaming service', e: '📺', need: false },
  { t: 'Limited-edition sneakers', e: '👟', need: false }, { t: 'Newest phone upgrade', e: '📱', need: false }, { t: 'Theme park trip', e: '🎢', need: false },
  { t: 'Takeout pizza', e: '🍕', need: false }, { t: 'Beach holiday', e: '🏖️', need: false }, { t: 'Fancy headphones', e: '🎧', need: false },
  { t: 'Loot boxes', e: '🎁', need: false }, { t: 'Fidget toys', e: '🌀', need: false }, { t: 'Battle pass', e: '🎟️', need: false }, { t: 'Phone case #4', e: '📱', need: false }, { t: 'Trendy water bottle', e: '🥤', need: false }, { t: 'Glasses you need to see', e: '👓', need: true }, { t: 'Calculator for maths', e: '🧮', need: true }
];

MQ.SCAMS = [
  { from: 'SMS · +1 (555) 0199', msg: 'Your parcel could not be delivered. Pay the $1.99 redelivery fee: bit.ly/pkg-redlvr', scam: true, explain: 'Unexpected delivery texts with short links are a classic phishing trick to steal card details.' },
  { from: 'Your bank\'s official app', msg: 'Your monthly statement is ready to view.', scam: false, explain: 'A notification inside the official app, with no link and no request for details, is normal.' },
  { from: 'DM · @crypto_king_wins', msg: 'Bro send me $50 and I\'ll flip it into $500 by Friday. 100% guaranteed 🚀', scam: true, explain: 'Guaranteed returns from a stranger = scam. Every time.' },
  { from: 'support@netflx-billing.co', msg: 'Your payment failed. Update your card within 24 hours to avoid suspension.', scam: true, explain: 'A misspelled domain plus urgency. Open the real app instead.' },
  { from: 'School portal (logged in)', msg: 'Reminder: Year 11 museum trip fee is due Friday. Pay in the parent portal.', scam: false, explain: 'An expected message inside an official system you logged into yourself is legit.' },
  { from: 'Pop-up ad', msg: 'FREE 10,000 game coins! Just log in with your username and password here.', scam: true, explain: 'Free in-game currency generators steal accounts.' },
  { from: 'Phone call', msg: '"This is the tax office. You owe back taxes. Pay now with gift cards or police will arrive."', scam: true, explain: 'Government agencies never demand gift cards or threaten instant arrest.' },
  { from: 'Job board', msg: 'Earn $2,000/week from home! No experience. Just pay $99 for your starter kit.', scam: true, explain: 'Real jobs pay you. They do not charge you to start.' },
  { from: 'Store you bought from', msg: 'Thanks for your order #48213! Your receipt is attached. No action needed.', scam: false, explain: 'A receipt for a purchase you actually made, asking nothing from you, is normal.' },
  { from: 'DM from a friend\'s account', msg: 'omg is this you in this video?? 😳 vid-share-clip.ru/watch', scam: true, explain: 'Hacked accounts send these to spread. Ask your friend another way.' },
  { from: 'Marketplace buyer', msg: 'I\'ll pay $200 extra for the bike. Just send the difference back to my courier.', scam: true, explain: 'Overpayment scams: their payment bounces, and the money you "sent back" is gone.' },
  { from: 'Your bank\'s app settings', msg: 'Tip: turn on two-factor authentication to protect your account.', scam: false, explain: 'Encouraging 2FA inside the real app is good security advice.' },
  { from: 'Email · prizes@luckywinner.biz', msg: 'Congratulations! You won a $1,000 gift card! Pay a $5 processing fee to claim.', scam: true, explain: 'You cannot win a contest you never entered, and real prizes do not need a fee.' },
  { from: 'School canteen app', msg: 'Top-up of $10 received. New balance: $14.50.', scam: false, explain: 'A receipt for a top-up you made, asking nothing from you, is normal.' }
];

MQ.TIPS = [
  'Pay yourself first: save before you spend.',
  'Wait 24 hours before buying a want.',
  'A $5 daily habit is about $1,825 a year.',
  'Rule of 72: 72 ÷ interest rate ≈ years to double.',
  'Pay your credit card in full to avoid interest.',
  'Diversify: do not put all your eggs in one basket.',
  'Your bank will never ask for your PIN or one-time code.',
  'Budget with net pay, not gross pay.',
  'Inflation slowly shrinks what cash can buy.',
  'Compare unit prices, not pack prices.',
  'Convert in-game currency back to real money before you buy.',
  'Saying "I\'m saving for something" is a perfectly good reason to skip.',
  'Weeks to your goal = price ÷ weekly savings.',
  'Use Spend / Save / Give jars for every bit of money you get.'
];
