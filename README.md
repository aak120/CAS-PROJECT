# 💸 MoneyQuest: Money Skills for Teens

A fun, game-style financial literacy app built for my CAS project. Teens learn money concepts through bite-sized lessons and quizzes, mini-games, streaks, leaderboards and **simulated** scenarios: a live fake stock market and a 12-month "first paycheck" life simulator.

> Everything in MoneyQuest is simulated and educational. No real money, real markets or financial advice.

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

MoneyQuest is a static website with no build step, so it works on any static host. It adapts to every screen:
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
js/country.js         Country modes (IN/US/UK) and country lessons
js/adaptive.js        Literacy Score, question generators, practice mode
js/personality.js     Money personality quiz
js/lifesim.js         Life Simulator engine + What-If + challenges
js/portfolio.js       Portfolio Simulator + historical data
js/games2.js          Budget Battle, Race, Inflation, Credit, Loan, Diversification
js/state.js           XP, levels, streaks, badges, leagues, friend codes (saved in localStorage)
js/ui.js              Toasts, confetti, sounds, charts, formatting helpers
js/app.js             Router and Home / Learn / Lesson / Ranks / Profile screens
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
- To have a real, live class leaderboard you'd need a backend (for example Firebase or Supabase). That would be a natural "version 2" for the project.

## CAS ideas

- **Creativity:** designing the lessons, games and simulations.
- **Service:** run a workshop with younger students using the app; collect feedback.
- **Evidence:** screenshots, a feedback survey, before/after quiz accuracy from testers, and your commit history showing how the app developed.

## Disclaimer

MoneyQuest is an educational game. All companies, prices, events and money are fictional. It is not financial advice.
