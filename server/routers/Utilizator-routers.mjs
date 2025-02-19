import express from 'express';
import { checkEmailExists, checkUsernameTaken, createUtilizator, loginUtilizator } from '../controllers/Utilizator-controller.mjs';

const router = express.Router();

router.post('/check-email', checkEmailExists);
router.post('/check-username', checkUsernameTaken);
router.post('/register', createUtilizator);
router.post('/login', loginUtilizator);

export default router;
