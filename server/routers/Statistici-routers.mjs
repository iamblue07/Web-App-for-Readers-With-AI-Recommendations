import express from "express";
import StatisticiController from "../controllers/Statistici-controller.mjs";
const router = express.Router();

router.get('/anunturi', StatisticiController.getBazarStatistici);
router.get('/carti', StatisticiController.getCartiStatistici);

export default router;
