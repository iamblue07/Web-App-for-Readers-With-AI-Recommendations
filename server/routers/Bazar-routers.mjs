import express from "express";
import bazarController from "../controllers/Bazar-controller.mjs";
import middleware from '../middleware/index.mjs';
import upload from "../middleware/multerUpload.mjs";

const router = express.Router();


router.post('/bazar/fetchBooksShort', middleware.middlewareAuth, bazarController.getCartiDataShort);
router.get('/bazar/getAnuntRights', middleware.middlewareAuth, bazarController.getAnuntRights);
router.post('/bazar/createAnunt', middleware.middlewareAuth, upload.single("bookImage"), bazarController.createAnunt);
export default router;