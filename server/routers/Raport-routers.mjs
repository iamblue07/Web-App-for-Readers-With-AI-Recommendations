import express from 'express';
import raportController from '../controllers/Raport-controller.mjs';
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/raport/creeazaRaport', middleware.middlewareAuth, raportController.creeazaRaport);
router.post('/raport/getReportsIDs', middleware.middlewareAuth, raportController.getReportsIDs);
router.get('/raport/getReportData/:raportID', middleware.middlewareAuth, raportController.getReportData);
router.get('/raport/getExtendedReportData/:raportID', middleware.middlewareAuth, raportController.getExtendedReportData);
export default router