# Backend API

Express and MongoDB API for the e-commerce application.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI`, JWT secrets, `CLIENT_URL`, Stripe, Cloudinary, and SMTP values in `.env`.

## Scripts

- `npm start`: start production server.
- `npm run dev`: start with nodemon.
- `npm run lint`: run ESLint.
- `npm test`: run API tests with Node's built-in test runner and in-memory MongoDB.
- `npm run seed`: run the database seeder if present.

## Runtime

- Health check: `GET /health`
- API base: `/api/v1`
- Swagger UI: `/api-docs`
