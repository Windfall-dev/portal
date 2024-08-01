This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Add .env.local file

```bash
TELEGRAM_BOT_TOKEN=
CIRCLE_API_KEY=
NEXT_PUBLIC_CIRCLE_APP_ID=
```

2. Run local PostgreSQL patabase

```bash
docker-compose up
```

2. Run portal app

```bash
npm i
npm run dev
```

## Tips

### Clean database

```bash
docker-compose down
rm -rf data
```
