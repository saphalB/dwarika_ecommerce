import express from 'express';

// Reviews feature removed — return 404 for any review route
const router = express.Router();

router.use((req, res) => {
  res.status(404).json({ message: 'Reviews feature is disabled' });
});

export default router;
