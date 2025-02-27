import express from "express";
import carteController from "../controllers/Carte-controller.mjs";
const router = express.Router();

router.post('/postCartiData', carteController.getCartiData);
router.post('/postCartiIDs', carteController.postCartiIDs);
export default router;