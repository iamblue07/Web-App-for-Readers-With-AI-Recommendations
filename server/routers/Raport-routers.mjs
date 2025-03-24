import express from 'express';
import raportController from '../controllers/Raport-controller.mjs';
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/raport/creeazaRaport', middleware.middlewareAuth, raportController.creeazaRaport);

export default router