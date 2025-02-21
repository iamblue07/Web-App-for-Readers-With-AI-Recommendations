import express from 'express';
import utilizatorController from '../controllers/Utilizator-controller.mjs';
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/check-email', utilizatorController.checkEmailExists);
router.post('/check-username', utilizatorController.checkUsernameTaken);
router.post('/register', utilizatorController.createUtilizator);
router.post('/login', utilizatorController.loginUtilizator);
router.get('/getUtilizatorData', middleware.middlewareAuth, utilizatorController.getUtilizatorData);
router.post('/updateUtilizatorDescriere', middleware.middlewareAuth, utilizatorController.updateUtilizatorDescriere);
router.post('/updateUtilizatorParolaHash', middleware.middlewareAuth, utilizatorController.updateUtilizatorParola);
router.post('/uploadImagineProfil', middleware.middlewareAuth, middleware.upload.single("image"), utilizatorController.uploadImagineProfil);

export default router;
