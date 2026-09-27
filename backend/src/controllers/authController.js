import { db } from '../data/dbStore.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await db.loginUser({ email, password });
    res.json({ success: true, message: "Login successful!", data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await db.createUser(req.body);
    res.status(201).json({ success: true, message: "Staff user created successfully!", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.updateUser(id, req.body);
    res.json({ success: true, message: "Staff user updated successfully!", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteUser(id);
    res.json({ success: true, message: "Staff user removed successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

