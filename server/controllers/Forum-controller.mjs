import models from "../models/index.mjs";
import dotenv from 'dotenv';
import { Op } from "sequelize";

dotenv.config();

const getForumuri = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * parseInt(limit);

        const whereClause = search
            ? { titluForum: { [Op.like]: `%${search}%` } }
            : {};

        const { rows: forums, count } = await models.Forum.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [["data", "DESC"]],
        });

        return res.status(200).json({
            forums: forums || [], // Dacă nu sunt forumuri, trimite un array gol
            totalPages: Math.max(1, Math.ceil(count / limit)), // Evită 0 pagini
        });

    } catch (error) {
        console.error("Eroare la preluarea forumurilor:", error);
        return res.status(500).json({ message: "Eroare internă a serverului" });
    }
};

const createForum = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!userId || isNaN(userId)){
            return res.status(404).json({message: "ID utilizator invalid"})
        }
        const user = await models.Utilizator.findByPk(userId)
        if(!user) return res.status(404).json({message: "Utilizatorul nu exista"})
        if(user.poateCreaForum === false) {
            return res.status(500).json({message: "Utilizatorul nu are dreptul de a crea forumuri!"})
        }
        const {newForumTitle} = req.body
        await models.Forum.create({
            titluForum: newForumTitle,
            data: new Date(),
            esteDeschis: true,
            idUtilizator: userId
        })
        return res.status(200).json({message: "Succes"})
    }catch(error) {
        console.log(error);
        return res.status(500).json({message:"Unauthorized!"})
    }
}

const getUserForumRights = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({message: "ID Utilizator invalid"})
        }
        const user = await models.Utilizator.findByPk(userId)
        if(!user) return res.status(404).json({message: "Utilizatorul nu exista"})
        const hasRights = user.poateCreaForum;
        return res.status(200).json({hasRights})
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: "Unauthorized!"})
    }
}



export default {
    getForumuri,
    createForum,
    getUserForumRights
}