import express from "express";
import middleware from '../middleware/index.mjs';
import forumController from "../controllers/Forum-controller.mjs";
const router = express.Router();

router.get('/getForumuri', forumController.getForumuri);
router.get('/getUserForumuri', middleware.middlewareAuth, forumController.getUserForumuri);
router.post('/createForum', middleware.middlewareAuth, forumController.createForum);
router.get('/getForumRights', middleware.middlewareAuth, forumController.getUserForumRights);
router.get('/forum/:idf', forumController.getMesajeForum);
router.get('/forum/:idf/getTitle', forumController.getForumTitleAndStatus);
router.post('/forum/:idForum/createMessage', middleware.middlewareAuth, forumController.createMesajForum);
router.post('/forum/changeForumTitle', middleware.middlewareAuth, forumController.changeForumTitle);
router.post('/forum/toggleForumStatus', middleware.middlewareAuth, forumController.toggleForumStatus);
export default router;