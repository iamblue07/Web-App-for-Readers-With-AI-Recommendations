import express from "express";
import carteController from "../controllers/Carte-controller.mjs";
const router = express.Router();

router.post('/postCartiData', carteController.getCartiData);
router.post('/postCartiIDs', carteController.postCartiIDs);
router.get('/:carteId/getCarteImagine', carteController.getCarteImagine)
export default router;