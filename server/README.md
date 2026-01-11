# Dwarika Backend Server

Backend API server for the Dwarika e-commerce platform.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dwarika
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

3. Start MongoDB (if running locally)

4. Create admin user:
```bash
node scripts/createAdmin.js
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Documentation

See the main README.md for complete API endpoint documentation.

