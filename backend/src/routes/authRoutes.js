import express from 'express';
import { login, getUsers, createUser, updateUser, deleteUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

