import express from "express";
import carteController from "../controllers/Carte-controller.mjs";
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/postCartiData', carteController.getCartiData);
router.post('/postCartiIDs', carteController.postCartiIDs);
router.get('/getRandomBooks', carteController.getRandomBooks);
router.get('/:carteId/getCarteImagine', carteController.getCarteImagine);
router.get('/carte/:idCarte', carteController.getOneCarte);
router.get('/carte/:idCarte/oferte', carteController.getOferteCarte);
router.get('/carte/:idCarte/esteCitita', middleware.middlewareAuth, carteController.getCarteCitita);
router.post('/carte/:idCarte/marcheazaCitita', middleware.middlewareAuth, carteController.postMarcheazaCarteCitita);
router.post('/carte/:idCarte/demarcheazaCitita', middleware.middlewareAuth, carteController.postDemarcheazaCarteCitita);
router.get('/getIstoric', middleware.middlewareAuth, carteController.getUtilizatorIstoric);
router.get('/getRecomandariCarti', middleware.middlewareAuth, carteController.getRecommendedBooks);
export default router;