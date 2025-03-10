import express from "express";
import bazarController from "../controllers/Bazar-controller.mjs";
import middleware from '../middleware/index.mjs';
import upload from "../middleware/multerUpload.mjs";

const router = express.Router();


router.post('/bazar/fetchBooksShort', middleware.middlewareAuth, bazarController.getCartiDataShort);
router.get('/bazar/getAnuntRights', middleware.middlewareAuth, bazarController.getAnuntRights);
router.post('/bazar/createAnunt', middleware.middlewareAuth, upload.single("bookImage"), bazarController.createAnunt);
router.post('/bazar/getAnuntIDs', bazarController.postAnuntBazarIDs);
router.post('/bazar/getAnunturiData', bazarController.getAnunturiData);
router.get('/bazar/:anuntId/getAnuntImagine', bazarController.getAnuntImagine);
export default router;