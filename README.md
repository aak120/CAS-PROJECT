# 💸 FiQuo: Money Skills for Teens

A fun, game-style financial literacy app built for my CAS project. Teens learn money concepts through bite-sized lessons and quizzes, mini-games, streaks, leaderboards and **simulated** scenarios: a live fake stock market and a 12-month "first paycheck" life simulator.

> Everything in FiQuo is simulated and educational. No real money, real markets or financial advice.

## Features

### 🏙️ Life Simulator (Teen Life + Future You)
- **Teen Life (main mode):** in India and Global mode teens live on pocket money and gifts (Diwali/holiday money, extra chores); in the US and UK they also have a part-time job. Costs include school stuff, lunches, bus fare and phone top-ups. Events include school trips, exam tutoring, game sales, loot boxes, birthday parties, "free skins" scams, selling old stuff and tutoring gigs. Teens can't get credit cards or loans, so overspending becomes an interest-free IOU to parents that has to be paid back.
- **Future You: First Salary:** fast-forward to age 22 with rent, a loan, BNPL and credit cards.
- **Generated characters:** for example "Sara, 22, junior designer, takes home ₹35,000. Rent ₹13,000, food ₹8,000, has ₹13,000 saved, wants a ₹1,10,000 scooter." Modes: **First Salary**, **Teen Part-Timer**, or **Custom** (type your own numbers).
- **Each payday:** essentials are paid, then you split the rest between wants, emergency fund, goal fund, investing (index / gold / hype stock) and extra debt payments.
- **The big purchase:** pay cash, take a **loan**, use **Buy Now Pay Later**, or a **credit card**, with real interest maths.
- **Random life events, scaled to your income:** car breakdown, stolen phone, promotion, rent hike, market crash, scam DM, employer pension match and more. If cash runs out, your emergency fund pays first, then the credit card. People with a buffer shrug; people living paycheck to paycheck get hurt.
- **Personalised:** your money personality changes which events appear.
- **A storyline in First Salary and Teen modes:** a money mentor introduces one concept each month, and features unlock step by step (big purchases in month 2, investing in month 3).
- **Payslips:** gross pay → approximate tax and deductions per country (PF in India, federal/state tax + FICA in the US, income tax + NI in the UK) → take-home.
- **Analytics at the end:** savings rate, emergency fund (months), debt-to-income, diversification, impulse spending, interest earned vs paid, biggest strength / weakness and the **concept to learn next**.
- **🧪 What If replays:** the engine is deterministic, so it replays your exact decisions with one change (save instead of borrowing, invest 10% more, inflation at 6%, a 25% crash, and so on). The suggestions are chosen from what you actually did.
- **⚔️ Multiplayer challenges:** share a code, your friend plays the identical life, and the app explains why your outcomes differed. **Pass & play** does the same on one phone, which is handy for classroom workshops.

### 🧺 Portfolio Simulator
Split ₹10 lakh / $10,000 / £10,000 across **Stocks, Bonds, ETFs, Gold, Cash, Real Estate**. Then live through **US markets 2000–2024**, **Indian markets 2008–2024**, or a **random future**, one year at a time. Each year explains *why* it happened (dot-com crash, 2008, taper tantrum, COVID, 2022 rate hikes…). Crashes ask you to sell, hold or buy more. Results show CAGR, real return after inflation, worst drop, diversification score, a "what if you'd picked one asset" comparison and What-If replays.

### 🎮 10 mini-games, each tied to a concept
| Game | Concept |
|---|---|
| Needs vs Wants | Budgeting (rapid-fire) |
| ⚔️ Budget Battle | Survive a month on a limited income |
| 🏁 Compound Interest Race | Time + rate vs 3 rivals |
| ✨ Interest Showdown | Compound interest intuition |
| 🎈 Inflation Dodge | Purchasing power and real returns |
| 💳 Credit Score Challenge | Builds a fictional score (CIBIL / FICO / Experian scale per country) |
| 🔍 Loan Detective | Total cost vs monthly payment, "0% EMI" and flat-rate tricks |
| 🧺 Diversification Challenge | Build portfolios for different goals and test them on 500 simulated futures |
| 🚨 Scam Simulator | Legit / Suspicious / Scam, then spot the red flags (phishing, Ponzi, fake investments, UPI/payment-app, identity theft, social media…) |
| 📈 Market Mania | Live fictional stock market |

### 🧠 Adaptive learning
- A **Teen Money Life** unit first (pocket money, gaming & digital spending, friends & FOMO, saving for something big), then 6 core units with teen examples, plus a **country unit** (🇮🇳 India / 🇺🇸 US / 🇬🇧 UK), with lesson cards and quizzes.
- **Financial Literacy Score** per category (Budgeting, Saving, Taxes & Income, Credit, Investing, Risk, Money Safety), built from lessons, games and sims, weighted towards recent answers.
- **Personal coach:** "You seem to be struggling with compound interest. Want a 3-minute challenge?" Practice uses **freshly generated questions** that get easier or harder as you answer, plus spaced review of questions you missed.
- The daily challenge is picked from your weakest topic.

### 🧩 Money personality
A scenario quiz at onboarding ("You have ₹10,000 left at the end of the month…") gives a profile such as 🟢 Planner · 🟡 Moderate risk · 🔴 Impulsive spending. It tailors the simulations and comes with a clear note that it is not a diagnosis or professional assessment.

### 📝 Quizzes & unit tests (like Khan Academy)
- Every unit has a **mid-unit quiz** after lesson 2 and a **unit test** at the end that mixes ideas from every lesson.
- **7 question types:** multiple choice, true/false, select all that apply, type a number, put in order, match up and **short answer (SAQ)**. Short answers are auto-marked by checking for key ideas, then show which ideas you hit and a model answer.
- Results give a score, a mastery level (Mastered 90%+, Proficient 70%+, Familiar 50%+), a breakdown by question type and the lessons worth reviewing. Each retake draws a new mix of questions.
- New badges: 🏁 Unit Master (90%+ on a unit test) and 🎯 Test Ace (100%).

### 🔥 Advanced courses
Three extra units on Standard and Advanced: **Investing Deep Dive** (index vs active funds, asset allocation, valuing a company), **How the Economy Works** (inflation and central banks, interest rates, exchange rates) and **Entrepreneur's Toolkit** (break-even, pricing and margins, cash flow and funding). Beginner sees a teaser.

### 🎚️ Difficulty levels & "How FiQuo works"
- **The lessons themselves change:** Beginner starts every lesson with an "🌱 In simple words" summary; Advanced ends it with a "🔥 Go deeper" card (e.g. zero-based budgeting, effective vs marginal tax, the compound interest formula) plus 2 extra-hard questions.
- **Tests change too:** Beginner 4-question quizzes / 8-question tests with gentler short-answer marking and hints; Standard 5 / 10; Advanced 6 / 12 with extra-hard questions and strict marking.
- **Beginner / Standard / Advanced**, chosen at sign-up or in Settings. Beginner gives more time, simpler questions and hints. Advanced adds harder generated questions to lessons, practice and the daily challenge, tighter game timers, trickier games and a tougher Life Sim, plus +25% XP. The Portfolio Simulator and Market Mania are the same on every level.
- **How FiQuo works** page (tap the Lv badge): every way to earn XP, all levels, coins, streaks, leagues, quests, badges and difficulty, explained.

### 📊 Measuring impact: Money Check, survey, teachers and "Our story"
- **Money Check:** a 10-question check when you start and again after 5 more lessons. Two matched versions (A/B, randomly ordered), "Not sure" instead of guessing, a confidence rating, and a before/after comparison by topic.
- **Feedback survey:** two agree/disagree questions, a 0–10 "would you recommend", a favourite feature and an optional comment.
- **Teacher dashboard** (`#/teacher`): free class codes and join links; anonymous class averages only, hidden until 3+ students have results.
- **Our story** page (`#/about`): why FiQuo exists, how it was built from feedback, how impact is measured, and live impact numbers.
- **Research backend:** a free Supabase project with opt-in, anonymous data (no names or emails) and a "delete my data" button. Setup: [docs/BACKEND.md](docs/BACKEND.md).

### 🗺️ Weekly quests & 🫙 real savings jar
- **Weekly quests:** three new quests every Monday (finish lessons, play games, run a simulation…), each with a coin reward, plus a bonus chest for finishing all three.
- **Real savings jar:** set a real-life goal, log money as you actually save it, and see progress and weeks to go. It's stored only on your device.

### 🏆 Leaderboards, streaks and achievements
- A weekly league plus boards by **category** (friends + optional simulated rivals): weekly XP, best simulator, best decisions, longest streak, most improved, best diversification.
- Streaks reward *learning*, with milestone badges at 7 / 30 / 100 days ("Financial Scholar") and streak freezes.
- 30+ achievements: Emergency Fund, Diversifier, Loan Slayer, Inflation Survivor, Scam Spotter, Market Survivor, Credit Builder and more.

### 🌎 Country modes
Currency, number format (₹10,00,000), typical salaries and prices, credit-score scale, approximate payslip deductions, student loans and a country-specific unit. Facts were checked in 2025, and the app reminds players to verify on official sites (rbi.org.in, incometax.gov.in, irs.gov, fdic.gov, gov.uk, fscs.org.uk).

> Historical returns in the Portfolio Simulator are approximate, rounded yearly figures from public index data, for learning only.

## Run it

It's a plain HTML/CSS/JavaScript app with no build step and nothing to install.

- **Quickest:** double-click `index.html` to open it in a browser.
- **Better (enables offline/installable mode):** run a tiny local server in this folder:
  ```bash
  python3 -m http.server 8000
  ```
  then open http://localhost:8000.

## Put it online (free)

FiQuo is a static website with no build step, so it works on any static host. It adapts to every screen:
- **Phones:** bottom tab bar.
- **Tablets:** wider single column.
- **Laptops and desktops:** sidebar navigation with two-column dashboards.

### Option A: Netlify (easiest, auto-updates)
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → pick this GitHub repo.
2. Branch: the branch you want live. **Build command:** leave empty. **Publish directory:** `.` (the included `netlify.toml` already sets this).
3. Click **Deploy**. Every push to that branch redeploys automatically.

No GitHub? Use the **drag and drop** box on Netlify's "Sites" page and drop the whole project folder.

### Option B: GitHub Pages
1. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, pick your branch and `/ (root)`, then save.
2. After a minute it's live at `https://<username>.github.io/<repo-name>/`. The included `.nojekyll` file makes GitHub serve every file as-is.

### Install it like an app
Open the site on a phone:
- **iPhone (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** ⋮ → **Install app**

On a laptop, Chrome and Edge show an install icon in the address bar. After the first visit it also works offline.

Progress is saved in each browser (no accounts), so a phone and a laptop keep separate progress. Use friend codes to compare.

> When you change files, bump `VERSION` in `sw.js` so installed copies pick up the update.

## Project structure

```
index.html            App shell (header, screen, bottom tabs)
css/styles.css        All styling, including light and dark themes
js/content.js         ✏️ Lessons, quizzes, game data and tips. Edit this to add content!
js/content-advanced.js Advanced courses and the Beginner/Advanced lesson extras
js/assess.js          Quizzes and unit tests: question banks, 7 question types, marking
js/impact.js          Money Check, survey, class codes, teacher dashboard, Our story page
js/cloud.js           Research backend client (Supabase REST, offline queue)
js/config.js          ✏️ Supabase URL and key, founder name, contact email
supabase/schema.sql   Database tables, privacy rules and statistics functions
js/country.js         Country modes (IN/US/UK) and country lessons
js/adaptive.js        Literacy Score, question generators, practice mode
js/personality.js     Money personality quiz
js/lifesim.js         Life Simulator engine + What-If + challenges
js/portfolio.js       Portfolio Simulator + historical data
js/games2.js          Budget Battle, Race, Inflation, Credit, Loan, Diversification
js/state.js           XP, levels, streaks, badges, leagues, friend codes (saved in localStorage)
js/ui.js              Toasts, confetti, sounds, charts, formatting helpers
js/app.js             Router and Home / Learn / Lesson / Ranks / Profile screens
js/extras.js          Weekly quests and the real-life savings jar
js/games.js           Game registry, Needs vs Wants, Scam Simulator, Interest Showdown
js/sims.js            Simulate hub + Market Mania
sw.js                 Offline caching (bump VERSION when you change files)
netlify.toml          Netlify settings (no build, cache headers)
.nojekyll             Tells GitHub Pages to serve files as-is
manifest.webmanifest  Makes the app installable
icons/                App icons
```

### Adding a lesson

Open `js/content.js`, find a unit and add an object to its `lessons` array:

```js
{
  id: 'saving-4', title: 'My New Lesson', emoji: '🧠',
  cards: [ { emoji: '💡', title: 'Card title', body: 'Card text, <b>HTML</b> allowed.' } ],
  quiz: [ { q: 'Question?', options: ['A', 'B', 'C'], answer: 1, explain: 'Why B is right.' } ]
}
```

`answer` is the index of the correct option (starting at 0). Write amounts as `$100`, and they switch to the player's currency automatically.

## How data works

- Progress is stored **only on the device** (browser `localStorage`). There are no accounts and no personal data is collected, which keeps it safe for students.
- League rivals are **simulated** players so there's always someone to race. The **Friends** tab uses copy-and-paste friend codes (snapshots of name, XP, streak) so real classmates can compare progress without a server.
- Names never leave the device (Google Analytics only gets screen names and event names).
- **Optional research sharing** (off by default) sends anonymous scores and survey answers with a random device ID to Supabase. See [docs/BACKEND.md](docs/BACKEND.md) for exactly what is stored and how to set it up.

## CAS ideas

- **Creativity:** designing the lessons, games and simulations.
- **Service:** run a workshop with younger students using the app; collect feedback.
- **Evidence:** screenshots, a feedback survey, before/after quiz accuracy from testers, and your commit history showing how the app developed.

## Disclaimer

FiQuo is an educational game. All companies, prices, events and money are fictional. It is not financial advice.
