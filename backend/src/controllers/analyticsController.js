import { db } from '../data/dbStore.js';

export const getAnalytics = async (req, res) => {
  try {
    const stats = await db.getAnalytics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
