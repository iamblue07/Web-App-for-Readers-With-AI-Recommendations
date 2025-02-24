import express from "express";
import middleware from '../middleware/index.mjs';
import forumController from "../controllers/Forum-controller.mjs";
const router = express.Router();

router.get('/getForumuri', forumController.getForumuri);
router.post('/createForum', middleware.middlewareAuth, forumController.createForum);
router.get('/getForumRights', middleware.middlewareAuth, forumController.getUserForumRights);
export default router;