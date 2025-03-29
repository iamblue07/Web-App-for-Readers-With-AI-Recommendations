import express from 'express';
import raportController from '../controllers/Raport-controller.mjs';
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/raport/creeazaRaport', middleware.middlewareAuth, raportController.creeazaRaport);
router.post('/raport/getReportsIDs', middleware.middlewareAuth, raportController.getReportsIDs);
router.get('/raport/getReportData/:raportID', middleware.middlewareAuth, raportController.getReportData);
router.get('/raport/getExtendedReportData/:raportID', middleware.middlewareAuth, raportController.getExtendedReportData);
router.post('/raport/disableRights', middleware.middlewareAuth, raportController.disableRights);
router.post('/raport/closeReport/:raportID', middleware.middlewareAuth, raportController.closeReport);
router.post('/raport/removeForumMessage/:messageID', middleware.middlewareAuth, raportController.removeForumMessage);
router.post('/raport/deleteObject/:obiectID', middleware.middlewareAuth, raportController.deleteObject);
export default router