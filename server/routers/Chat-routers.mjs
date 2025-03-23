import express from "express";
import chatController from "../controllers/Chat-controller.mjs";
import middleware from '../middleware/index.mjs';
const router = express.Router();

router.post('/chat/getChatIDs', middleware.middlewareAuth, chatController.getChatIDs);
router.post('/chat/getChatMessagesIDs', middleware.middlewareAuth, chatController.getChatMessagesIDs);
router.get('/chat/getMesajData/:mesajID', middleware.middlewareAuth, chatController.getMesajData);
router.get('/chat/getMesajMedia/:mesajID', chatController.getMesajMedia);
router.get('/chat/getChatData/:chatID', middleware.middlewareAuth, chatController.getChatData);
router.post('/chat/sendMessage', middleware.middlewareAuth, chatController.sendMessage);
router.post('/chat/uploadMedia', middleware.middlewareAuth, middleware.secondUpload.single("media"), chatController.sendMedia);
router.get('/chat/checkAnuntContactat/:anuntID', middleware.middlewareAuth, chatController.checkAnuntContactat);
router.post('/chat/:anuntID/createChat', middleware.middlewareAuth, chatController.createChat);
export default router;