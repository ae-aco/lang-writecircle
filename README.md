# WriteCircle - Product Concept

A community-driven language learning platform where users practice writing in their target language and receive corrections from native speakers.

🔗 **Live Demo:** coming soon

## About

WriteCircle was inspired by heritage speakers looking for ways to improve their heritage language — a pain point underserved by mainstream language apps. 
The app focuses on reading and writing, with peer correction at its core.

The credit system ("Pages") creates a virtuous cycle: earn pages by correcting others, spend pages to submit your own writing for correction.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Language:** TypeScript
- **Deployment:** Vercel

## Key Features

- Two-step signup with native/learning language selection and CEFR level
- Peer correction queue filtered by native language
- Word-level diff view showing corrections with red/green highlights
- Pages system — earn by correcting, spend to submit
- Daily streak tracking with weekly calendar
- Prompt of the Day to inspire writing
- Challenges page (coming soon)
- 50+ languages supported including Swahili, Twi, Yoruba, Ewe and more

## Product Decisions Worth Noting

- **Pages over credits** — "Pages" ties to the journal/exercise book metaphor of language learning, more meaningful than a generic credit system
- **Async over real-time** — thoughtful corrections beat rushed chat
- **Native language queue filtering** — users only see posts they're qualified to correct, maintaining quality
- **LCS diff algorithm** — used Longest Common Subsequence for word-level diff rendering, same approach as Git

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/lang-writecircle
cd lang-writecircle
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```

## My Contributions

**Product**
- Defined requirements and wrote user stories with acceptance criteria
- Prioritised backlog using MoSCoW method
- Made key product decisions (pages system, language variants, async model)
- Designed wireframes and iterated on UI in Figma

**Technical**
- Built full-stack Next.js application with Supabase
- Designed database schema with RLS policies
- Implemented auth flow with language preference onboarding
- Built diff algorithm for correction view
- Set up streak tracking with daily activity logging

## Roadmap

- [ ] Drafts accessible from dashboard
- [ ] Deactivate account
- [ ] Change email address  
- [ ] Dark/light mode
- [ ] File attachments (images, audio)
- [ ] AI-powered correction explanations
- [ ] Writing challenges system
- [ ] Second native language support

## Tools Used

Claude AI, Windsurf (Cascade), Figma Make, Supabase, Vercel, GitHub Projects