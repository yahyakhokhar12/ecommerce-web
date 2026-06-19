<<<<<<< HEAD
# Ecommerce Web

Production-ready MERN e-commerce application with React, Vite, Redux Toolkit, Express, MongoDB, Stripe, Cloudinary, email templates, admin analytics, wishlist, reviews, coupons, Docker, linting, and tests.

## Folder Structure

```text
ecommerce-web/
  backend/
    src/
      config/          database, providers, environment config
      controllers/     API request handlers
      docs/            Swagger setup
      jobs/            scheduled jobs
      middlewares/     auth, upload, validation, error handling
      models/          Mongoose models
      routes/          Express routers
      services/        analytics and email services
      templates/       HTML email templates
      tests/           backend API tests
      utils/           shared API, logging, token helpers
  frontend/
    src/
      api/             RTK Query API slices
      app/             Redux store
      components/      layout, common, forms, UI primitives
      features/        Redux slices
      hooks/           reusable hooks
      pages/           public, user, and admin pages
      routes/          app route guards and route map
  docker-compose.yml
  package.json
```

## Requirements

- Node.js 22+ and npm 10+
- MongoDB 7+ for local backend runtime, or MongoDB Atlas
- Stripe keys for payments
- Cloudinary credentials for product images
- SMTP credentials for transactional email

## Environment

Copy `backend/.env.example` to `backend/.env` for local backend development.

Copy `frontend/.env.example` to `frontend/.env` for local frontend development.

Copy root `.env.example` to `.env` before `docker compose up --build`.

Important variables:

- `MONGO_URI`: MongoDB connection string used by the backend.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: long random JWT secrets.
- `CLIENT_URL`: browser origin allowed by CORS.
- `VITE_API_URL`: frontend API base URL, usually `http://localhost:5000/api/v1`.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe browser key.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: backend Stripe credentials.
- `CLOUDINARY_*`: image upload credentials.
- `SMTP_*`, `FROM_EMAIL`, `FROM_NAME`: outbound email configuration.

## Local Setup

```bash
npm run install:all

cd backend
copy .env.example .env
npm run dev

cd ..\frontend
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. API health is available at `http://localhost:5000/health`; Swagger docs are available at `http://localhost:5000/api-docs`.

## Database Setup

Local MongoDB:

```bash
docker run --name ecommerce-mongo -p 27017:27017 -d mongo:7
```

Use this in `backend/.env`:

```text
MONGO_URI=mongodb://localhost:27017/ecommerce
```

Tests use `mongodb-memory-server`, so they do not require a local MongoDB instance.

## Standard Commands

```bash
npm run build
npm run lint
npm test
npm run audit
```

Backend-only:

```bash
cd backend
npm start
npm run dev
npm test
```

Frontend-only:

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Docker

```bash
copy .env.example .env
docker compose up --build
```

Frontend: `http://localhost`

Backend: `http://localhost:5000`

MongoDB runs as the `mongo` service and persists data in the `mongo_data` volume.

## Deployment

Backend:

1. Deploy `backend/` as a Node service.
2. Build with `npm ci --omit=dev`.
3. Start with `npm start`.
4. Set all backend environment variables from `backend/.env.example`.
5. Configure Stripe webhooks to call `/api/v1/payment/webhook`.

Frontend:

1. Deploy `frontend/` as a Vite static app.
2. Build with `npm ci && npm run build`.
3. Publish `frontend/dist`.
4. Set `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` at build time.

## API

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `GET /api/v1/products`
- `GET /api/v1/categories`
- `POST /api/v1/orders`
- `POST /api/v1/payment/create-intent`
- `GET /api/v1/admin/dashboard`

See `/api-docs` for the full Swagger UI.
=======
# ecommerce-website

Full-stack MERN e-commerce app with a React frontend and a Node/Express backend.

**Structure**
- `frontend` React app
- `backend` Express API + MongoDB

**Prerequisites**
- Node.js 18+ (20 recommended)
- MongoDB connection string

**Setup**
1. Backend
Create `backend/.env` with:
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```
Then run:
```
cd backend
npm install
npm run dev
```

2. Frontend
```
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000` and expects the API at `http://localhost:5000`.

**Deploy (Vercel single project, same domain)**
This repo is configured to deploy both frontend and backend in one Vercel project.

1. In Vercel, import this repo and set Root Directory to the repo root.
2. Add backend environment variables in Vercel:
   `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`
3. Deploy.

The `vercel.json` at repo root builds the React app from `frontend/` and exposes the Express API as serverless functions under `/api`.

**Scripts**
- Backend: `npm run dev` (nodemon), `npm start`
- Frontend: `npm start`, `npm run build`
>>>>>>> a0095055bba0d4c777d62a743cf779805fd20563
