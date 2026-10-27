# FiQuo research backend (Supabase)

FiQuo's backend is a free Supabase project. It stores **anonymous** Money Check scores, unit test
scores and survey answers, powers the live numbers on the **Our story** page (`#/about`) and the
**teacher dashboard** (`#/teacher`). No accounts, no names, no emails.

The website itself still runs on Netlify. Supabase is billed separately, and its free plan is
enough for thousands of learners. Calls from the app to Supabase do **not** use Netlify build credits.

## One-time setup (about 10 minutes)

1. Go to <https://supabase.com>, sign in with GitHub and click **New project**.
   - Name: `fiquo`. Region: **Mumbai (ap-south-1)** for India.
   - Save the database password somewhere safe (you won't need it in the app).
2. When the project is ready, open **SQL Editor → New query**, paste the whole of
   [`supabase/schema.sql`](../supabase/schema.sql) and click **Run**. You should see "Success".
3. Open **Project Settings → API Keys** (or **Data API**) and copy:
   - the **Project URL** (looks like `https://abcdefghijkl.supabase.co`)
   - the **publishable key** (`sb_publishable_...`), or the legacy **anon public** key (`eyJ...`).
   Never copy the `service_role` or **secret** key: that one must never go in the app.
4. Put both into [`js/config.js`](../js/config.js) (or send them to Claude) and deploy once.

The publishable/anon key is designed to be public. The database rules in `schema.sql` only let it
**insert** rows and read **totals**: nobody can download individual rows with it.

## Daily use

| What | Where |
| --- | --- |
| See raw data | Supabase → **Table Editor** → `money_checks`, `test_results`, `surveys` |
| Download for analysis | Table Editor → table → **Export → CSV** (open in Google Sheets or Excel) |
| Approve a quote for the story page | `surveys` table → set `approved` to `true` on rows where `quote_ok` is true. Check the quote has no names or personal details first. |
| Remove spam or test data | Table Editor → select rows → Delete |
| Live public numbers | <https://fiquo.netlify.app/#/about> |

**Free projects pause after a week with no activity.** If that happens, open the Supabase
dashboard and click **Restore**. Nothing is lost meanwhile: the app keeps unsent results on each
device and sends them later.

## What gets stored

| Table | Columns | Never stored |
| --- | --- | --- |
| `money_checks` | random device ID, before/after, form A/B, score, per-topic scores, confidence 1–5, seconds taken, lessons done, country, difficulty, age band, class code | name, email, IP address in the table, device details |
| `test_results` | random device ID, unit, quiz/test, score %, number of questions, difficulty, country, class code | answers to individual questions |
| `surveys` | random device ID, two 1–5 ratings, 0–10 recommend score, favourite feature, optional comment and whether it may be quoted | name |
| `classes` | class code, class name, a **hash** of the teacher key | teacher name or email |

Sharing is **opt-in** (unticked by default), with a note asking under-18s to check with a parent or
guardian. Anyone can delete everything their device sent from **Profile → Research & class**.

## How the impact numbers are calculated

- **Average improvement** = mean of (after % − before %) over fair before/after pairs. A pair counts
  only if the "before" check was taken with 3 or fewer lessons done and the "after" check came later
  with more lessons done.
- **Two matched forms**: each device randomly gets form A or B first and the other one second
  (counterbalancing), so one form being easier can't inflate the result.
- **Effect size** (Cohen's d for paired data) = mean gain ÷ standard deviation of gains. Shown once
  there are 5+ pairs. Rough guide: 0.2 small, 0.5 medium, 0.8 large.
- **NPS** = % who answered 9–10 minus % who answered 0–6.
- Teacher dashboards hide everything until a class has 3+ learners, and hide before/after averages
  until there are 3+ pairs.

## Reporting it honestly (CV, CAS, college essays)

- Quote the number of **pairs**, not just the average: "Across 120 learners with before/after
  checks, scores rose from 46% to 71% on average (+25 points)".
- This is a simple before/after study without a control group, so say "improved after using
  FiQuo" rather than "FiQuo caused". That honesty reads well to admissions readers.
- Remove obvious test or spam rows before quoting numbers, and keep the CSV exports as evidence.

## Legal note (not legal advice)

The system is designed to collect no personal data: no names, emails or accounts, a random ID, and
coarse age bands. India's DPDP Act requires verifiable parental consent to process **personal**
data of under-18s, so keep it anonymous: don't add name or email fields. When working with a
school, ask the school to approve use in class; schools usually handle parent communication.
For anything beyond this (accounts, names, paid features), get advice from an adult or a lawyer first.
