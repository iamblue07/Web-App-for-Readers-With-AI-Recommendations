import models from "../models/index.mjs";
import dotenv from 'dotenv';
import { Sequelize } from "sequelize";

dotenv.config();

const creeazaRaport = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({error:"Missing or invalid user ID"});
        }
        const {idObiect, tipObiect, descriereRaport} = req.body;
        await models.Raport.create({
            obiectRaport: tipObiect,
            idObiect: idObiect,
            descriere: descriereRaport,
            esteDeschis: true,
            idRaportor: userId,
            dataRaport: new Date()
        })
        return res.status(200).json({message: "Success"});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const getReportsIDs = async(req,res) => {
    try{
        const {currentPage, viewOpenClosedReports, itemsPerPage} = req.body;

        const page = currentPage > 0 ? currentPage : 1;
        const limit = itemsPerPage > 0 ? itemsPerPage : 10;
        const offset = (page - 1) * limit;

        const reports = await models.Raport.findAll({
            attributes: ['id'],
            where: {
                esteDeschis: viewOpenClosedReports
            },
            order: [['dataRaport', 'DESC']],
            limit,
            offset
        });
        const ids = reports.map(report => report.id);
        const totalIDs = await models.Raport.count({ where: { esteDeschis: viewOpenClosedReports } });

        return res.status(200).json({ids, totalIDs});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const getReportData = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(401).json({error:"Invalid user token"});
        }
        const user = await models.Utilizator.findByPk(userId);
        if(!user) {
            return res.status(404).json({error:"Missing user"});
        }
        if(user.esteAdministrator === false) {
            return res.status(400).json({error:"Ilegal Request: User not admin"});
        }
        const {raportID} = req.params;
        if(!raportID || isNaN(raportID)) {
            return res.status(404).json({error:"Invalid report ID"});
        }
        const report = await models.Raport.findByPk(raportID);
        return res.status(200).json(report);
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const getExtendedReportData = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({error:"Missing user ID"});
        }
        const user = await models.Utilizator.findByPk(userId);
        if(!user) {
            return res.status(404).json({error:"Missing user"});
        }
        if(user.esteAdministrator === false) {
            return res.status(400).json({error:"ILEGAL REQUEST: USER NOT ADMINISTRATOR"})
        }
        const {raportID} = req.params;
        if(!raportID || isNaN(raportID)) {
            return res.status(404).json({error:"Missing raport ID"});
        }
        const raport = await models.Raport.findByPk(raportID);
        var data;
        if(raport.obiectRaport === "MesajChat") {
            data = await models.MesajChat.findByPk(raport.idObiect, {
                attributes: ['id', 'idUtilizator', 'idChat', 'esteMedia', 'continut', 'data']
            });

        }
        if(raport.obiectRaport === "MesajForum") {
            data = await models.MesajForum.findByPk(raport.idObiect, {
                attributes: ['id', 'idUtilizator', 'continut', 'data']
            });
        }
        if(raport.obiectRaport === "Forum") {
            data = await models.Forum.findByPk(raport.idObiect, {
                attributes: ['id', 'idUtilizator', 'titluForum', 'data']
            });
        }
        if(raport.obiectRaport === "Anunt") {
            data = await models.AnuntBazar.findByPk(raport.idObiect, {
                attributes: ['id', 'idUtilizator', 'titluAnunt', 'descriereAnunt', 'dataAnunt']
            })
        }
        const reportedUser = await models.Utilizator.findByPk(data.idUtilizator, {
            attributes: ['username']
        });
        const reporterUser = await models.Utilizator.findByPk(raport.idRaportor, {
            attributes: ['username']
        });
        return res.status(200).json({data, reportedUsername: reportedUser.username, reporterUsername: reporterUser.username});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const disableRights = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)){
            return res.status(404).json({error:"Missing administrator token"});
        }
        const admin = await models.Utilizator.findByPk(userId);
        if(!admin || !admin.esteAdministrator) {
            return res.status(404).json({error:"Missing administrator rights"});
        }
        const {penalizedUserID, removedRights} = req.body;
        if(!penalizedUserID || isNaN(penalizedUserID)) {
            return res.status(404).json({error:"Missing penalized user ID"});
        }
        const penalizedUser = await models.Utilizator.findByPk(penalizedUserID);
        if(!penalizedUser) {
            return res.status(404).json({error:"Missing penalized user data"});
        }
        if(removedRights === "Anunt") {
            penalizedUser.poateCreaAnunt = false;
        }
        else if(removedRights === "Forum") {
            penalizedUser.poateCreaForum = false;
        }
        else if(removedRights === "MesajChat" || removedRights === "MesajForum") {
            penalizedUser.poateTrimiteMesaj = false;
        } 
        else if(removedRights === "Raport") {
            penalizedUser.poateRaporta = false;
        }
        else {
            return res.status(404).json({error:"Unknown rights requested"});
        }
        await penalizedUser.save();
        return res.status(200).json({Message: "Success"});
    }catch(error){
        return res.status(500).json({error:"Internal server error"});
    }
}

const closeReport = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)){
            return res.status(404).json({error:"Missing administrator token"});
        }
        const admin = await models.Utilizator.findByPk(userId);
        if(!admin || !admin.esteAdministrator) {
            return res.status(404).json({error:"Missing administrator rights"});
        }
        const {raportID} = req.params;
        if(!raportID || isNaN(raportID)) {
            return res.status(404).json({error:"Missing report ID"});
        }
        const raport = await models.Raport.findByPk(raportID);
        if(!raport) {
            return res.status(404).json({error:"Missing report data"});
        }
        raport.esteDeschis = false;
        await raport.save();
        return res.status(200).json({message:"Success"});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const removeForumMessage = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)){
            return res.status(404).json({error:"Missing administrator token"});
        }
        const admin = await models.Utilizator.findByPk(userId);
        if(!admin || !admin.esteAdministrator) {
            return res.status(404).json({error:"Missing administrator rights"});
        }
        const {messageID} = req.params;
        if(!messageID || isNaN(messageID)) {
            return res.status(404).json({error:"Missing message ID"});
        }
        const message = await models.MesajForum.findByPk(messageID);
        if(!message) {
            return res.status(404).json({error:"Missing message data"});
        }
        message.continut = "!!!MESAJ STERS DE CATRE ADMINISTRATOR!!!";
        await message.save();
        return res.status(200).json({message:"Success"});
    }catch(error) {
        return res.status(500).json({error:"Internal Server Error"});
    }
}

const deleteObject = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)){
            return res.status(404).json({error:"Missing administrator token"});
        }
        const admin = await models.Utilizator.findByPk(userId);
        if(!admin || !admin.esteAdministrator) {
            return res.status(404).json({error:"Missing administrator rights"});
        }
        const {obiectID} = req.params;
        const {obiectRaport} = req.body;
        if(!obiectID || isNaN(obiectID)) {
            return res.status(404).json({error:"Missing object ID"});
        }
        if(obiectRaport === "Anunt") {
            const obiect = await models.AnuntBazar.findByPk(obiectID);
            await obiect.destroy();
        }
        else if(obiectRaport === "Forum") {
            const obiect = await models.Forum.findByPk(obiectID);
            await obiect.destroy();
        } else{
            return res.status(401).json({error:"Unknown object type"});
        }
        return res.status(200).json({message:"Success"});
    }catch(error){

    }
}

export default {
    creeazaRaport,
    getReportsIDs,
    getReportData,
    getExtendedReportData,
    disableRights,
    closeReport,
    removeForumMessage,
    deleteObject
}