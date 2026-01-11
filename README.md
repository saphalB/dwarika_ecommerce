Dwarika — Small Jewelry E‑commerce (frontend + backend)

Simple, practical e‑commerce app for jewelry with an admin dashboard to manage products, users, orders and banners.

Purpose
- Provide a lightweight storefront (React + Vite) and a Node/Express API backed by MongoDB.
- Built to be easy to run locally for development and testing.

Quick links
- Frontend: `src/` (main app in `src/App.jsx`)
- Backend: `server/` (Express API, models in `server/models`)
- Admin UI: `src/admin/AdminDashboard.jsx`
- API helpers: `src/utils/api.js`

Prerequisites
- Node.js (16+ recommended)
- npm or yarn
- MongoDB (local or remote)

Local development

1) Install dependencies

```bash
# root (frontend)
npm install

# backend
cd server
npm install
```

2) Configure server environment

Create `server/.env` with at least:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dwarika
JWT_SECRET=replace-this-with-a-secure-secret
```

3) Start backend and frontend

Open two terminals:

```bash
# terminal 1 — backend
cd server
npm run dev

# terminal 2 — frontend (project root)
npm run dev
```

Notes
- The frontend will use Vite and typically run on `http://localhost:5173` (auto-selects if the port is busy).
- If the backend fails to start because the port is in use, change `PORT` in `server/.env` or stop the other process.

Admin setup
- The repo includes `server/scripts/createAdmin.js` to create an initial admin user. Run from the `server/` folder:

```bash
node scripts/createAdmin.js
# or provide email/password: node scripts/createAdmin.js admin@you.com strongpassword
```

Project structure (overview)

```
dwarika-main/
├─ server/            # Express API, models, routes, utility scripts
├─ src/               # React frontend (App.jsx is the main app)
│  ├─ admin/          # admin dashboard UI
│  └─ utils/          # API wrapper helpers
├─ public/            # static assets
└─ package.json       # frontend scripts/deps
```

Common commands

- Install (root): `npm install`
- Run frontend dev: `npm run dev`
- Run backend dev: `cd server && npm run dev`
- Build frontend: `npm run build`

Where to look in the code
- Frontend app boot: `src/main.jsx` → `src/App.jsx` (routes, pages and UI)
- API calls & endpoints used by the UI: `src/utils/api.js`
- Admin UI: `src/admin/AdminDashboard.jsx`
- Server entry: `server/server.js`

Troubleshooting quick tips
- Backend EADDRINUSE: change `PORT` in `server/.env` or kill the process using the port.
- MongoDB connection errors: verify `MONGODB_URI` and that MongoDB is reachable.
- If frontend can't reach API, confirm `server` is running and `fetch` URLs in `src/utils/api.js` point to the right host/port.

Contributing and notes
- This repository is intended for private development. Keep secrets out of source control.
- If you want a public license, add one (MIT/Apache/etc.) and update this file.

Contact
- For questions, check the `server/` README or open an issue with details and logs.

---
Updated README written to be concise and hand‑readable.
# Dwarika E-commerce Platform

A full-stack e-commerce platform for jewelry with a complete admin dashboard for managing products, users, orders, and banners.

## Features

### Frontend (Customer)
- Beautiful, responsive jewelry-themed design
- Product browsing and search
- Featured collections
- Shopping cart functionality
- Checkout process
- Cash on delivery payment option
- Product details with quantity selection

### Admin Dashboard
- **Product Management**: Create, read, update, and delete products
- **User Management**: Manage customer and admin accounts
- **Order Management**: View and update order statuses, track payments
- **Banner Management**: Manage homepage banners and promotional content
- **Dashboard Statistics**: View total products, users, orders, and revenue

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dwarika
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Note**: For production, use a strong, random JWT_SECRET and a secure MongoDB connection string.

### 4. Start MongoDB

Make sure MongoDB is running on your system. If using a local installation:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### 5. Create Admin User

Run the admin creation script:

```bash
cd server
node scripts/createAdmin.js
```

This will create an admin user with:
- Email: `admin@dwarika.com`
- Password: `admin123`

You can customize the email and password:
```bash
node scripts/createAdmin.js your-email@example.com your-password
```

**Important**: Change the admin password after first login!

### 6. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

### 7. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### 8. Access the Application

- **Customer Frontend**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`

## API Endpoints

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get single order (admin only)
- `POST /api/orders` - Create order (public)
- `PUT /api/orders/:id` - Update order (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)
- `GET /api/orders/stats/summary` - Get order statistics (admin only)

### Banners
- `GET /api/banners` - Get all banners (public, filtered by active)
- `GET /api/banners/:id` - Get single banner (public)
- `POST /api/banners` - Create banner (admin only)
- `PUT /api/banners/:id` - Update banner (admin only)
- `DELETE /api/banners/:id` - Delete banner (admin only)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

## Project Structure

```
dwarika-main/
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   │   ├── Product.js
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Banner.js
│   ├── routes/            # API routes
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── orders.js
│   │   ├── banners.js
│   │   └── auth.js
│   ├── middleware/        # Middleware functions
│   │   └── auth.js
│   ├── scripts/           # Utility scripts
│   │   └── createAdmin.js
│   ├── server.js          # Main server file
│   └── package.json
├── src/                   # Frontend React app
│   ├── admin/             # Admin dashboard
│   │   └── AdminDashboard.jsx
│   ├── utils/             # Utility functions
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── ...
└── package.json
```

## Admin Dashboard Features

### Dashboard
- Overview statistics (products, users, orders, revenue)
- Quick access to all management sections

### Product Management
- View all products in a table
- Add new products with full details
- Edit existing products
- Delete products
- Filter by status (active, inactive, out of stock)
- Set featured products

### User Management
- View all users (customers and admins)
- Create new users
- Edit user details and roles
- Suspend/activate users
- Change user passwords

### Order Management
- View all orders with details
- Update order status (pending, confirmed, processing, shipped, delivered, cancelled)
- View order details including items and shipping address
- Track payment status

### Banner Management
- Create promotional banners
- Set banner position (hero, featured, sidebar, footer)
- Activate/deactivate banners
- Add links to banners

## Security Notes

- All admin routes are protected with JWT authentication
- Passwords are hashed using bcryptjs
- Admin-only routes require both authentication and admin role
- Change default admin credentials in production
- Use environment variables for sensitive data
- Implement rate limiting for production
- Use HTTPS in production

## Development

### Running in Development Mode

Frontend (with hot reload):
```bash
npm run dev
```

Backend (with auto-restart):
```bash
cd server
npm run dev
```

### Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the MONGODB_URI in `.env` file
- Verify MongoDB is accessible from your network

### Admin Login Issues
- Make sure you've created an admin user using the script
- Check that the user has `role: 'admin'` in the database
- Verify JWT_SECRET is set in `.env`

### API Connection Issues
- Ensure backend server is running on port 5000
- Check CORS settings if accessing from different origin
- Verify API_URL in frontend code matches backend URL

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
