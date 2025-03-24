import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import { Op } from "sequelize";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getChatIDs = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: "ID utilizator invalid!" });
        }

        const chatIDs = await models.ChatBazar.findAll({
            attributes: ['id'],
            where: {
                [Op.or]: [
                    { idCumparator: userId },
                    { idVanzator: userId }
                ]
            },
            order: [['data', 'ASC']]
        });

        return res.status(200).json(chatIDs.map(chat => chat.id));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const getChatMessagesIDs = async(req, res) => {
    try{
        const userId = req.user.id;
        if (!userId || isNaN(userId)) {
            return res.status(404).json({ error: "ID utilizator invalid!" });
        }
        const { chatID } = req.body;
        if(!chatID || isNaN(chatID)) {
            console.log(chatID);
            return res.status(404).json({error:"ID chat invalid!"});
        }
        const chat = await models.ChatBazar.findByPk(chatID);
        if(!chat) {
            return res.status(404).json({error:"No Chat found at this ID inside DB!"});
        }
        if(chat.idVanzator != userId && chat.idCumparator != userId) {
            return res.status(401).json({error: "WARNING! NOT SELLER OR BUYER!"});
        }
        const messagesIDs = await models.MesajChat.findAll({
            where: {idChat: chatID},
            attributes: ["id"],
            order: [["data", "ASC"]]
        });
        return res.status(200).json(messagesIDs);

    }catch(error){
        return res.status(500).json({error:"Internal Server Error"})
    }
}

const getMesajData = async(req, res) => {
    try{
        const userId = req.user.id;
        if (!userId || isNaN(userId)) {
            return res.status(404).json({ error: "ID utilizator invalid!" });
        }
        const mesajID = req.params.mesajID;
        if(!mesajID || isNaN(mesajID)) {
            return res.status(404).json({error:"Missing mesajID"});
        }
        const mesaj = await models.MesajChat.findByPk(mesajID)
        const acelasiUser = mesaj.idUtilizator === userId;
        if(mesaj.esteMedia === false) {
            return res.status(200).json({idMesaj:mesaj.id, acelasiUser:acelasiUser, esteMedia:mesaj.esteMedia, continut:mesaj.continut, idUtilizator:mesaj.idUtilizator});
        }
        return res.status(200).json({idMesaj:mesaj.id, acelasiUser:acelasiUser, esteMedia:mesaj.esteMedia, idUtilizator:mesaj.idUtilizator});

    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const getMesajMedia = async(req, res) => {
    try{
        const mesajID = req.params.mesajID;
        if(!mesajID || isNaN(mesajID)) {
            return res.status(404).json({error:"ID Mesaj invalid"});
        }
        const mesaj = await models.MesajChat.findByPk(mesajID);
        if(!mesaj || !mesaj.caleMedia) {
            return res.status(404).json({error:"Missing media or message"});
        }
        const caleAbsoluta = path.resolve(mesaj.caleMedia);
        return res.status(200).sendFile(caleAbsoluta);
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const getChatData = async (req, res) => {
    try {
        const chatID = req.params.chatID;
        if (!chatID || isNaN(chatID)) {
            return res.status(404).json({ error: "ID Chat invalid" });
        }

        const chat = await models.ChatBazar.findByPk(chatID);
        if (!chat) {
            return res.status(404).json({ error: "Missing chat" });
        }

        const vanzator = await models.Utilizator.findByPk(chat.idVanzator);
        const cumparator = await models.Utilizator.findByPk(chat.idCumparator);

        if (!vanzator || !cumparator) {
            return res.status(404).json({ error: "Missing user(s)" });
        }
        const userId = req.user.id;
        const userVinde = vanzator.id === userId; 
        const anunt = await models.AnuntBazar.findByPk(chat.idAnunt);

        if (!anunt) {
            return res.status(404).json({ error: "Missing anunt" });
        }

        return res.status(200).json({
            userVinde: userVinde,
            vanzatorUsername: vanzator.username,
            cumparatorUsername: cumparator.username,
            idAnunt: anunt.id,
            titluAnunt: anunt.titluAnunt
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const sendMessage = async (req, res) => {
    try{
        const userId = req.user.id;
        const {chatID, newMessage} = req.body;
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: "ID utilizator invalid" });
        }
        const user = await models.Utilizator.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Utilizatorul nu există" });
        if(!chatID || isNaN(chatID)) {
            return res.status(400).json({message: "Missing chat ID"});
        }
        await models.MesajChat.create({
            idUtilizator: userId,
            idChat: chatID,
            esteMedia: false,
            continut: newMessage,
            caleMedia: null,
            data: new Date()
        })
        return res.status(200).json({message: "Succes"});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const sendMedia = async (req, res) => {
    try{
        if(!req.file) {
            return res.status(400).json({message:"Niciun fisier incarcat!"});
        }
        const userId = req.user.id;
        const {chatID} = req.body;
        const caleMedia = `uploadsMessages/${req.file.filename}`;
        const user = await models.Utilizator.findByPk(userId);
        if(!user) {
            return res.status(404).json({message:"Utilizatorul nu exista"});
        }
        await models.MesajChat.create({
            idUtilizator: userId,
            idChat: chatID,
            esteMedia: true,
            continut:null,
            caleMedia: caleMedia,
            data: new Date()
        })
        return res.status(200).json({message: "Succes!"});
    }catch(error){
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const checkAnuntContactat = async (req, res) => {
    try{
        const userId = req.user.id;
        const anuntID = req.params.anuntID;
        if(!userId || !anuntID) {
            return res.status(400).json({error:"Missing IDs"});
        }
        const chatBazar = await models.ChatBazar.findOne({
            where: {idAnunt: anuntID, idCumparator: userId}
        })
        if(!chatBazar) {
            return res.status(200).json({hasContacted: false});
        }
        return res.status(200).json({ hasContacted: true, chatID: chatBazar.id});
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const createChat = async (req, res) => {
    try{
        const userId = req.user.id;
        const anuntID = req.params.anuntID;
        if(!userId || !anuntID) {
            return res.status(400).json({message:"Missing IDs"});
        }
        const anunt = await models.AnuntBazar.findByPk(anuntID);
        if(!anunt) {
            return res.status(404).json({message:"Missing anunt"});
        }
        const chatBazar = await models.ChatBazar.findOne({
            where: {idAnunt: anuntID, idCumparator: userId}
        })
        const exists = !!chatBazar;
        if(exists){
            return res.status(400).json({message:"Chat already exists"});
        }
        const newChat = await models.ChatBazar.create({
            idAnunt: anunt.id,
            idVanzator: anunt.idUtilizator,
            idCumparator: userId,
            data: new Date(),
            esteDeschis:true
        })
        const {newMessage} = req.body;
        await models.MesajChat.create({
            idUtilizator: userId,
            idChat: newChat.id,
            esteMedia: false,
            continut: newMessage,
            caleMedia: null,
            data: new Date()
        })
        return res.status(200).json({message: "Success"})

    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const checkIsOpen = async(req, res) => {
    try{
        const chatID = req.params.chatID;
        if(!chatID || isNaN(chatID)){
            return res.status(404).json({error:"Missing ID"});
        }
        const chat = await models.ChatBazar.findByPk(chatID);
        if(!chat){
            return res.status(404).json({error:"Missing chat"});
        }
        return res.status(200).json({isOpen:chat.esteDeschis});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const openCloseChat = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId) {
            return res.status(400).json({message:"Missing IDs"});
        }
        const chatID = req.params.chatID;
        if(!chatID || isNaN(chatID)){
            return res.status(404).json({error:"Missing ID"});
        }
        const chat = await models.ChatBazar.findByPk(chatID);
        if(!chat){
            return res.status(404).json({error:"Missing chat"});
        }
        if(chat.idVanzator === userId){
            return res.status(200).json({success:false})
        }
        if(chat.idCumparator === userId) {
            chat.esteDeschis = !chat.esteDeschis;
            await chat.save();
            return res.status(200).json({success:true})
        }
        return res.status(400).json({error:"Not buyer, nor seller!"});
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export default {
    getChatIDs,
    getChatMessagesIDs,
    getMesajData,
    getMesajMedia,
    getChatData,
    sendMessage,
    sendMedia,
    checkAnuntContactat,
    createChat,
    checkIsOpen,
    openCloseChat,
};