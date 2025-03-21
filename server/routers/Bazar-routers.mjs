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
router.get('/bazar/getAnunturileMeleIDs', middleware.middlewareAuth, bazarController.getAnunturileMeleIDs);
router.get('/bazar/anunt/:anuntId', bazarController.getAnuntData);
router.post('/bazar/updateAnunt', middleware.middlewareAuth, bazarController.postUpdateAnunt);
router.post('/bazar/InchideAnunt/:anuntId', middleware.middlewareAuth, bazarController.postInchideAnunt);
router.post('/bazar/StergeAnunt/:anuntId', middleware.middlewareAuth, bazarController.postStergeAnunt);
router.get('/bazar/anunturiIDs/:carteID', bazarController.getAnunturiIDs);

export default router;