import express from 'express';
import utilizatorController from '../controllers/Utilizator-controller.mjs';
import preferinteController from '../controllers/Preferinte-controller.mjs';
import middleware from '../middleware/index.mjs';
const router = express.Router();



router.get('/:userId/getImagineProfil', utilizatorController.getImagineProfil);
router.get('/:userId/getUtilizatorPreferinte', middleware.middlewareAuth, preferinteController.getUtilizatorPreferinte);
router.post('/updateUtilizatorPreferinte', middleware.middlewareAuth, preferinteController.updateUtilizatorPreferinte);
router.get('/getProfile/:userID', utilizatorController.getProfile);
router.get('/getUserArticles/:userID', utilizatorController.getArticles);
router.get('/getUserForums/:userID', utilizatorController.getForums);
export default router