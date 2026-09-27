import { db } from '../data/dbStore.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json({ success: true, message: "Settings saved successfully!", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
