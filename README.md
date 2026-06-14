# 🛍️ LuxeCart — Premium MERN E-Commerce Platform

A production-ready, full-stack e-commerce application built with React, Node.js, Express, MongoDB, and Stripe.

![Banner](https://via.placeholder.com/1200x400/8b5cf6/ffffff?text=LuxeCart+Premium+E-Commerce)

## ✨ Features

- 🛒 Complete shopping experience (browse, cart, checkout, orders)
- 🔐 JWT authentication with refresh tokens & RBAC
- 💳 Stripe payment integration with webhooks
- 📧 Beautiful HTML email templates
- 📊 Admin analytics dashboard with Recharts
- 🎨 Premium UI with glassmorphism, gradients & animations
- 🌗 Dark/Light mode with persistence
- 📱 Fully responsive (320px to 4K)
- ☁️ Cloudinary image uploads
- 🎟️ Coupon system
- ❤️ Wishlist
- ⭐ Product reviews
- 🐳 Docker & Docker Compose ready

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Redux Toolkit, RTK Query, Tailwind, Shadcn UI, Framer Motion, Recharts
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Stripe, Cloudinary, Nodemailer
**DevOps:** Docker, Docker Compose, Nginx, Winston Logger, Jest

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account
- Cloudinary account
- SMTP email (Gmail/SendGrid)

### Installation

```bash
# Clone
git clone <repo>
cd ecommerce-mern

# Backend
cd backend
cp .env.example .env  # fill in values
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env  # fill in values
npm install
npm run dev
```

Visit http://localhost:5173

### Docker

```bash
docker-compose up --build
```

Visit http://localhost

## 📦 Deployment

### Backend → Render
1. Push to GitHub
2. New → Web Service → Connect repo → Root: `backend`
3. Build: `npm install` | Start: `npm start`
4. Add all env vars
5. Deploy

### Frontend → Vercel
1. New Project → Import repo → Root: `frontend`
2. Framework: Vite
3. Add `VITE_API_URL` env var
4. Deploy

## 📁 Project Structure

```
ecommerce-mern/
├── backend/         # Express API
├── frontend/        # React app
└── docker-compose.yml
```

## 🔑 API Endpoints

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET  /api/v1/products` - List products (filter, sort, paginate)
- `POST /api/v1/orders` - Create order
- `POST /api/v1/payment/create-intent` - Stripe payment
- `GET  /api/v1/admin/dashboard` - Admin stats
- ... see `/api-docs` for full Swagger docs

## 🧪 Testing

```bash
cd backend && npm test
cd frontend && npm test
```

## 📄 License

MIT
