# m5s.chat

Project of Theo's cloneathon of [T3.chat](https://t3.chat).

## Features

- [x] - Multi-model and Auto Mode (AI will choose the best model to you).
- [x] - Synchronization
- [x] - Retry messages (and history)
- [x] - Chat branching
- [x] - Syntax highlighting
- [x] - Markdown support

## Self hosting

### Requirements

- [Convex account](https://www.convex.dev/).
- [Clerk account](https://clerk.com/).
- [OpenRouter key](https://openrouter.ai/).
- [Bun](https://bun.sh/) installed.

### Steps

1. Clone the repository:

```bash
git clone https://github.com/matheuslanduci/m5s-chat
```

2. Install dependencies:

```bash
cd m5s-chat
bun install
```

1. Create a `.env.local` file in the root directory and add your environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_FRONTEND_API_URL=
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
VITE_CONVEX_SITE=
OPENROUTER_API_KEY=
CLERK_SECRET_KEY=
```

3. Run the development server:

```bash
bun run dev
```

4. Run the Convex deployment:

```bash
bunx convex dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## License

Free for personal and commercial use.