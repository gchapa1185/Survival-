# Episodic: the plan

**Goal:** make enough recurring revenue to cover a Claude subscription ($20/mo Pro, $100/mo Max 5x, or $200/mo Max 20x), then keep growing.

**Product:** Episodic turns a local business into a 30-episode short-video *series* for TikTok, Reels and Shorts. Every episode comes with a hook, a shot list, on-screen text, and a caption written to rank in TikTok and Instagram search. The owner films it on their phone. The free tier shows 3 episodes; $9/month unlocks full seasons, as many new seasons as they want, AI-tailored episodes, and CSV export.

---

## 1. What the trends say (Sept 2026)

| Trend | Evidence | What Episodic does with it |
|---|---|---|
| **Social is search** | 49% of US consumers have used TikTok as a search engine, up from 41% two years earlier; ~60% research products on Instagram. Keywords in the first ~50 caption characters lift visibility 20–40%. | Every caption opens with a real local search phrase ("best bakery in San Antonio"). Tested: all 30 captions put the keyword inside the first 50 characters. |
| **Series beat one-off posts** | 57% of consumers prefer brands that post original series. YouTube launched Shorts Series (seasons and episodes). Microdramas passed 6.5B views on YouTube in H1 2026. | The output is a *show* with 5 recurring segments and a numbered "Day N" arc, not 30 unrelated posts. |
| **Real beats polished, AI ads get punished** | Nearly a third of consumers are less likely to choose a brand that uses AI-generated ads. Human-led storytelling is the differentiator. | AI plans the content; the owner stars in it. No AI video, no invented testimonials (the prompt forbids fake quotes). |
| **UGC and reviews drive buying** | 70% of shoppers "often or always" look for user-generated content before buying, double last year. | A weekly "Real Customers, Real Words" segment built around reviews the business already has. |
| **Everyday life is content** | Romanticizing mundane routines and hyper-specific insider humor lead the TikTok/Reels trend lists. | "The Everyday, Made Cinematic" and "Things I'd Never Do as a [baker]" segments. |
| **Small businesses can't stay consistent** | 73% cite lack of time and 58% inconsistent posting as top frustrations. Most start strong and quit after 4–6 weeks. Inconsistent posters see 61% less engagement per post. | The pitch is "never wonder what to post again": 30 days planned in 20 seconds, filmed in one weekly batch. |

**Market gap:** general AI social tools cost $19–$109/mo (ContentStudio, Postrillo, Jasper, Apaya) and are built for marketers who manage many accounts. A bakery owner doesn't want a scheduler with 20 channels. They want to be told what to film tomorrow. Nothing cheap is aimed at that one job, **local search plus series format**, which is the gap Episodic fills.

---

## 2. Unit economics and break-even

| Item | Per subscriber per month |
|---|---|
| Price | $9.00 |
| Stripe fee (2.9% + $0.30) | −$0.56 |
| Claude API (≈15K output tokens/season at $20/M, ~3 seasons/mo) | ≈ −$1.00 |
| **Net contribution** | **≈ $7.40** |

Fixed costs: hosting about $7/mo (Render/Railway starter; the free tier also works), domain about $1/mo.

| Target | Monthly cost to cover | Paying subscribers needed |
|---|---|---|
| Claude Pro | $20 + $8 | **4** |
| Claude Max 5x | $100 + $8 | **15** |
| Claude Max 20x | $200 + $8 | **29** |

Free previews use the template generator, which costs **$0** in API spend, so free traffic never loses money. Only paying users hit the Claude API.

---

## 3. Go-to-market: get the first 30 customers

Distribution is the hard part, so the plan leans on channels that cost time, not money.

1. **Use the product as its own marketing (TikTok/IG/Shorts).** Run a series called *"Day N: I planned a month of content for a local business in 20 seconds."* Each episode picks a real local business, generates its season on screen, and tags the business. This is serialized content (the trend) and a product demo at once, and tagged businesses often reshare it.
2. **Personalized cold outreach, 20 a day.** Generate a free 3-episode preview for a specific local business and DM or email it to them: "I made this for [name], free. Want the other 27?" A ready-made plan with their name on it converts far better than a pitch.
   - Funnel math: 600 contacts in 30 days → ~10% open the link (60) → 15–25% convert (9–15 paying). That covers Pro in month 1 and gets close to Max 5x.
3. **Communities:** r/smallbusiness, r/TikTokMarketing, local Facebook business groups, chambers of commerce, and Small Business Development Centers (SBDC; they run free social media workshops and need tools to recommend).
4. **SEO pages (month 2):** programmatic pages such as `/plan/bakery-san-antonio` showing a free sample season. Each one targets "[type] social media ideas [city]" searches.
5. **Referral:** one free month for both sides (Stripe promotion codes are already enabled at checkout).

### 90-day milestones

| When | Milestone | Success signal |
|---|---|---|
| Week 0 | Deploy, connect Stripe, launch content series | App live, first 3 videos posted |
| Weeks 1–2 | 5 free beta businesses, collect testimonials | 3+ say they filmed at least 5 episodes |
| Day 30 | **4 paying: Pro covered** | ≥ $36 MRR |
| Day 60 | 15 paying: Max 5x covered | ≥ $135 MRR |
| Day 90 | 29+ paying: Max 20x covered | ≥ $260 MRR |

**Kill or pivot rule:** if there are fewer than 3 paying customers by day 45, test (a) a one-time $19 "Season Pack" instead of a subscription, and (b) a $49/mo agency tier for freelancers who manage 5–10 local clients. If neither moves by day 75, the market has said no. Stop and reuse the code.

---

## 4. Product roadmap (after launch, driven by customers)

1. **Email reminders.** A "Today's episode" email each morning, the biggest lever against week-6 churn.
2. **Monthly re-season.** A fresh season on the 1st of every month, so the subscription feels alive.
3. **Review import.** Paste a Google review link and get proof episodes built from real reviews.
4. **Agency tier.** Multiple businesses under one login.
5. **Per-plan AI quota** (e.g. 10 AI seasons a month) to cap worst-case API spend.

---

## 5. Risks, stated plainly

- **Nothing here guarantees revenue.** Four customers is a low bar, but it still takes consistent outreach. The code is the easy 20%.
- **Crowded category.** There are many AI content tools. The defense is narrow focus (local search plus series, filmed by the owner) and price ($9, under every competitor listed).
- **Churn.** Small businesses cancel when busy. Reminders and monthly seasons are the counter.
- **Platform shifts.** If TikTok search weakens, the series format still works on Reels and Shorts.
- **AI quality.** Template mode guarantees a usable result even if the API fails. AI output is checked against a strict JSON schema, and the prompt forbids invented claims and testimonials.

---

## 6. What you need to do (about 1 hour)

I can't open accounts or take payments myself, so these steps are yours:

1. **Stripe:** create an account, add a $9/month recurring Product, and copy the Price ID and secret key.
2. **Anthropic API key** from console.anthropic.com, for AI-tailored seasons (optional: the app works without one).
3. **Deploy:** push this repo to Render or Railway (Node, `npm start`) and set the env vars from `.env.example`.
4. **Domain** (optional, about $12/yr), then set `PUBLIC_URL`.
5. **Record episode 1** of the "I planned a month of content for a local business" series.

---

### Sources
- [Sprout Social: 2026 social media trends](https://sproutsocial.com/insights/social-media-trends/)
- [Sprout Social: TikTok SEO](https://sproutsocial.com/insights/tiktok-seo/) · [Metricool: TikTok SEO 2026](https://metricool.com/tiktok-seo/) · [ALM Corp: TikTok SEO guide](https://almcorp.com/blog/tiktok-seo/)
- [iQfluence: social trends 2026](https://iqfluence.io/public/blog/social-trends) · [Dash Social trends report](https://www.dashsocial.com/resources/social-media-trends-report) · [Hootsuite social trends](https://www.hootsuite.com/research/social-trends)
- [Slate: serialized content 2026](https://slateteams.com/blog/social-media-trends-2026) · [YouTube blog: Shorts Series](https://blog.youtube/news-and-events/made-on-youtube-creators-shorts-series-tv-features/)
- [Pepper Agency: TikTok & Instagram trends Sept 2026](https://www.pepperagency.com/blog/tiktok-instagram-trends-for-september-2026-and-how-brands-can-actually-use-them) · [SocialBee Instagram trends](https://socialbee.com/blog/latest-instagram-trends/)
- [Enrich Labs: small business social media 2026](https://www.enrichlabs.ai/blog/small-business-social-media-marketing-2026) · [US Tech Automations: SMB automation pain points](https://ustechautomations.com/resources/blog/small-business-social-media-automation-pain-solution-2026)
- [Apaya: AI social media cost 2026](https://apaya.com/blog/ai-social-media-management-costs) · [Postrillo: best AI tools for SMBs](https://postrillo.com/blogs/the-7-best-ai-social-media-tools-for-small-businesses-in-2026)
- [Claude pricing (IntuitionLabs)](https://intuitionlabs.ai/articles/claude-pricing-plans-api-costs) · [Preuve: creator economy ideas](https://preuve.ai/blog/creator-economy-startup-ideas-2026)
