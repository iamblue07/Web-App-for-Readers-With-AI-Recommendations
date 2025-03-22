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
            order: [['data', 'DESC']]
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
            order: [["data", "DESC"]]
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
            return res.status(200).json({acelasiUser:acelasiUser, esteMedia:mesaj.esteMedia, continut:mesaj.continut, idUtilizator:mesaj.idUtilizator});
        }
        return res.status(200).json({acelasiUser:acelasiUser, esteMedia:mesaj.esteMedia, idUtilizator:mesaj.idUtilizator});

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

export default {
    getChatIDs,
    getChatMessagesIDs,
    getMesajData,
    getMesajMedia
};