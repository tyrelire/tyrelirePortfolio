# tyrelirePortfolio

Monorepo with two apps:

- `frontend`: Next.js 16 app
- `backend`: Express + Prisma API

## Prerequisites

- Node.js 20+
- npm 10+
- MariaDB/MySQL running locally (or reachable)

## Project Structure

```text
backend/
frontend/
```

## Install Dependencies

Install each app dependencies separately.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

### Backend (`backend/.env`)

Required:

```env
PORT=5000
DATABASE_URL="mysql://root@localhost:3306/portfolio"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="portfolio"
AUTH_SECRET="<long-random-secret>"
ADMIN_PSEUDO="tyrelire"
ADMIN_INITIAL_PASSWORD="<initial-password>"
```

Notes:

- `ADMIN_PSEUDO` and `ADMIN_INITIAL_PASSWORD` are used to bootstrap the first admin account.
- `AUTH_SECRET` must be a long random value.

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

## Run In Development

Start backend:

```bash
cd backend
npm run dev
```

Start frontend (in another terminal):

```bash
cd frontend
npm run dev
```

Apps:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Backend Commands

From `backend/`:

```bash
npm run dev
npm run seed:about
npm run seed:admin
```

Useful Prisma commands:

```bash
npx prisma generate
npx prisma db push
npx prisma migrate dev
```

## Frontend Commands

From `frontend/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Build Checks

Backend typecheck:

```bash
cd backend
npx tsc --noEmit
```

Frontend production build:

```bash
cd frontend
npm run build
```
