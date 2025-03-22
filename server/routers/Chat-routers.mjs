import express from "express";
import chatController from "../controllers/Chat-controller.mjs";
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/chat/getChatIDs', middleware.middlewareAuth, chatController.getChatIDs);
router.post('/chat/getChatMessagesIDs', middleware.middlewareAuth, chatController.getChatMessagesIDs);
router.get('/chat/getMesajData/:mesajID', middleware.middlewareAuth, chatController.getMesajData);
router.get('/chat/getMesajMedia/:mesajID', chatController.getMesajMedia);
export default router;