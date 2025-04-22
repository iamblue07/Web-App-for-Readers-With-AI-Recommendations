import express from "express";
import scraperController from "../controllers/Scraper/Scraper-controller.mjs";
import middleware from '../middleware/index.mjs';
import {upload} from "../middleware/multerUpload.mjs";

const router = express.Router();

router.get('/startScraping', scraperController.startScraping);

export default router;