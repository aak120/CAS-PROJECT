# 💸 MoneyQuest: Money Skills for Teens

A fun, game-style financial literacy app built for my CAS project. Teens learn money concepts through bite-sized lessons and quizzes, mini-games, streaks, leaderboards and **simulated** scenarios: a live fake stock market and a 12-month "first paycheck" life simulator.

> Everything in MoneyQuest is simulated and educational. No real money, real markets or financial advice.

## Features

| Area | What's in it |
|---|---|
| 📚 **Learn** | 6 units, 18 lessons (Money Basics, Saving & Banking, Earning & Taxes, Credit & Debt, Investing, Money Safety). Swipe-style cards, then a quiz. Wrong answers come back at the end, Duolingo-style. Up to 3 stars per lesson. |
| 🔥 **Streaks & goals** | Daily XP goal with a progress ring, a day streak, a 7-day activity strip and Streak Freezes you can buy with coins. |
| ⚡ **Daily challenge** | One new question every day for bonus XP. |
| 🎮 **Mini-games** | **Needs vs Wants** (45-second swipe sort with combos), **Scam or Legit?** (spot phishing and scams), **Interest Showdown** (which option compounds to more?). |
| 📈 **Market Mania sim** | Start with $10,000 of pretend money. 7 fictional companies, an index fund and a bond fund. Prices move live (1×/2×/4× speed), breaking news moves the market, dividends get paid, trades cost a fee, and at the end of the "year" you compare yourself with just holding the index. |
| 🧑‍💼 **Life Sim** | 12 months with a part-time job and a savings goal. Budget each payday with sliders, then handle a random life event (cracked phone, concert, scam DM, dentist...). Overspend and your emergency fund covers it, then a 24% APR credit card. Ends with a grade. |
| 🏆 **Leaderboards** | Weekly leagues (Bronze → Diamond) with promotion and demotion against simulated rivals, plus a **Friends** board built from shareable friend codes, so classmates can compete without any server. |
| 🏅 **Progress** | Levels and titles, XP history chart, unit progress, quiz accuracy, 17 badges, coin shop (avatars, streak freezes). |
| ⚙️ **Settings** | Currency symbol ($, £, €, ₹, ¥, …), daily goal, light/dark theme, sound. |

## Run it

It's a plain HTML/CSS/JavaScript app with no build step and nothing to install.

- **Quickest:** double-click `index.html` to open it in a browser.
- **Better (enables offline/installable mode):** run a tiny local server in this folder:
  ```bash
  python3 -m http.server 8000
  ```
  then open http://localhost:8000.

## Put it on your phone (free)

1. Push this repo to GitHub (already done if you're reading this there).
2. On GitHub go to **Settings → Pages** and under "Build and deployment" choose **Deploy from a branch**, pick your branch and the `/ (root)` folder, then save.
3. After a minute your app is live at `https://<your-username>.github.io/<repo-name>/`.
4. Open that link on your phone:
   - **iPhone (Safari):** Share → **Add to Home Screen**
   - **Android (Chrome):** ⋮ menu → **Install app** / **Add to Home screen**

It then opens full-screen with its own icon like a normal app, and works offline after the first visit.

> **App Store / Google Play?** You can wrap this same code with [Capacitor](https://capacitorjs.com/) later to publish to the stores. Apple requires a paid developer account ($99/year) and a Mac with Xcode. For a CAS project, the installable web app is usually the practical route.

## Project structure

```
index.html            App shell (header, screen, bottom tabs)
css/styles.css        All styling, including light and dark themes
js/content.js         ✏️ Lessons, quizzes, game data and tips. Edit this to add content!
js/state.js           XP, levels, streaks, badges, leagues, friend codes (saved in localStorage)
js/ui.js              Toasts, confetti, sounds, charts, formatting helpers
js/app.js             Router and Home / Learn / Lesson / Ranks / Profile screens
js/games.js           The three mini-games
js/sims.js            Market Mania + Life Sim
sw.js                 Offline caching (bump VERSION when you change files)
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
