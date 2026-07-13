# 🕯️ ShriniAura — Premium Handmade Scented Candles

A full-stack MERN e-commerce platform for a premium handmade candle brand.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS v4, Framer Motion, Zustand, TanStack Query
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Auth**: JWT + Refresh Tokens (httpOnly cookies)
- **Payments**: Razorpay
- **Images**: Cloudinary
- **Email**: Nodemailer (Gmail SMTP)

---

## 📁 Project Structure

```
ShriniAura/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, Cloudinary
│   │   ├── controllers/   # Auth, Product, Order, User, Admin
│   │   ├── middleware/    # Auth, Error handler
│   │   ├── models/        # User, Product, Order
│   │   ├── routes/        # All API routes
│   │   └── services/      # Email service
│   ├── seed.js            # Sample data seeder
│   └── .env
└── frontend/
    └── src/
        ├── components/    # Navbar, Footer, ProductCard, UI
        ├── pages/         # Home, Products, Cart, Checkout, Orders, Admin
        ├── store/         # Zustand: auth, cart, theme
        └── lib/           # Axios instance
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account
- Gmail account (for email)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shrini_aura
JWT_SECRET=your_strong_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: `admin@shriniaura.com` / `Admin@123`
- **User**: `user@shriniaura.com` / `User@123`
- **10 sample products** across all 5 categories

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 🛍️ Features

### User
- Browse candles by 5 categories
- Search & filter (price, category, sort)
- Product detail with reviews & ratings
- Add to cart / wishlist
- Secure checkout with Razorpay
- Order history & tracking
- Profile management

### Admin (`/admin`)
- Dashboard with revenue charts
- Add / Edit / Delete products
- Manage orders & update status
- View all users

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | ✓ | Logout |
| POST | `/api/auth/refresh` | — | Refresh token |
| GET | `/api/products` | — | List products (filter/sort/paginate) |
| GET | `/api/products/featured` | — | Featured products |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/reviews` | ✓ | Add review |
| POST | `/api/orders` | ✓ | Create order + Razorpay |
| POST | `/api/orders/:id/verify-payment` | ✓ | Verify payment |
| GET | `/api/orders/my` | ✓ | My orders |
| GET | `/api/orders/:id` | ✓ | Order detail |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/users/profile` | ✓ | Get profile |
| PUT | `/api/users/profile` | ✓ | Update profile |
| GET | `/api/users/wishlist` | ✓ | Get wishlist |
| PUT | `/api/users/wishlist/:productId` | ✓ | Toggle wishlist |
| GET | `/api/admin/dashboard` | Admin | Analytics |

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render / Railway)
- Set all `.env` variables in the platform dashboard
- Start command: `npm start`
- Set `NODE_ENV=production`
- Set `CLIENT_URL` to your Vercel frontend URL

---

## 🎨 Candle Collections
| Collection | Theme |
|---|---|
| T-Lights | Rose, Lavender, Jasmine |
| Urlis | Vanilla, Sandalwood, Caramel |
| Plant Lovers | Saffron, Marigold, Cinnamon |
| Baby Shower | Sea Salt, Driftwood, Bergamot |
| Jar Glass | Oud, Bulgarian Rose, Black Orchid |
