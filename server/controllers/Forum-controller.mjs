import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
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
            offset,
            order: [["data", "DESC"]],
        });

        const forumsWithUsernames = await Promise.all(
            forums.map(async (forum) => {
                const utilizator = await models.Utilizator.findByPk(forum.idUtilizator);
                return {
                    ...forum.toJSON(),
                    username: utilizator ? utilizator.username : "deletedUser",
                };
            })
        );

        return res.status(200).json({
            forums: forumsWithUsernames,
            totalPages: Math.max(1, Math.ceil(count / limit)),
        });

    } catch (error) {
        console.error("Eroare la preluarea forumurilor:", error);
        return res.status(500).json({ message: "Eroare internă a serverului" });
    }
};

const getUserForumuri = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(404).json({ message: "ID utilizator invalid" });
        }

        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * parseInt(limit);

        const whereClause = {
            idUtilizator: userId,
            ...(search ? { titlu: { [Op.like]: `%${search}%` } } : {})
        };

        const { rows: forums, count } = await models.Forum.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset,
            order: [["data", "DESC"]],
        });

        return res.status(200).json({
            forums,
            totalPages: Math.max(1, Math.ceil(count / limit)),
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
        const hasRights = user.poateTrimiteMesaj;
        const hasReportRights = user.poateRaporta;
        return res.status(200).json({hasRights, hasReportRights})
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: "Unauthorized!"})
    }
}

const getMesajeForum = async (req, res) => {
    try {
        const { idf } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const mesaje = await models.MesajForum.findAndCountAll({
            where: { idForum: idf },
            include: [{
                model: models.Utilizator,
                attributes: ['id', 'username', 'caleImagineProfil']
            }],
            limit: limitNumber,
            offset: (pageNumber - 1) * limitNumber,
            order: [['data', 'DESC']]
        });

        if (!mesaje) {
            return res.status(404).json({ message: 'Ceva eroare' });
        }

        const mesajeFormatate = mesaje.rows.map(mesaj => {
            const avatarPath = mesaj.Utilizator.caleImagineProfil 
                ? `/uploads/${path.basename(mesaj.Utilizator.caleImagineProfil)}`
                : null;

            return {
                id: mesaj.id,
                continut: mesaj.continut,
                idUser: mesaj.Utilizator.id,
                username: mesaj.Utilizator.username,
                data: mesaj.data,
                avatar: avatarPath
            };
        });

        return res.json({
            messages: mesajeFormatate,
            totalMessages: mesaje.count,
            totalPages: Math.ceil(mesaje.count / limitNumber),
            currentPage: pageNumber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Eroare server.' });
    }
};

const getForumTitleAndStatus = async (req, res) => {
    try {
        const {idf} = req.params;
        if(!idf) return res.status(404).json({message: "Missing forum id"});
        const forum = await models.Forum.findByPk(idf);
        if(!forum) return res.status(404).json({message: "Missing forum"});
        return res.status(200).json({
            title: forum.titluForum,
            status: forum.esteDeschis
        })
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Eroare server.' });
    }
}

const createMesajForum = async (req, res) => {
    try {
        const userId = req.user.id;
        const {idForum} = req.params;
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: "ID utilizator invalid" });
        }
        
        const user = await models.Utilizator.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Utilizatorul nu există" });
        if (!user.poateTrimiteMesaj) {
            return res.status(403).json({ message: "Nu ai dreptul de a trimite mesaje!" });
        }

        const { message } = req.body;
        if (!idForum || !message.trim()) {
            return res.status(400).json({ message: "Date invalide" });
        }

        await models.MesajForum.create({
            idUtilizator: userId,
            idForum,
            continut:message,
            data: new Date()
        });

        return res.status(201).json({ message: "Mesaj trimis cu succes" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Eroare internă a serverului" });
    }
};

const changeForumTitle = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({message: "ID Utilizator invalid"})
        }
        const {forumId, newTitle} = req.body;
        const forum = await models.Forum.findByPk(forumId);
        if(forum && forum.idUtilizator === userId) {
            forum.titluForum = newTitle;
            await forum.save();
            return res.status(200).json({ message: "Titlul a fost schimbat cu succes!" });
        }
        return res.status(401).json({message:"Utilizatorul nu detine forumul!"})
    } catch(error) {
        console.log(error);
        return res.status(500).json({message:"Eroare la schimbarea titlului!"})
    }
}

const toggleForumStatus = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({message: "ID Utilizator invalid"})
        }
        const {newStatus, forumId} = req.body;
        const forum = await models.Forum.findByPk(forumId);
        if(forum && forum.idUtilizator === userId) {
            forum.esteDeschis = newStatus;
            await forum.save();
            return res.status(200).json({message: "Status schimbat cu succes"})
        }
        return res.status(401).json({message: "Utilizatorul nu detine forumul!"});
    }catch(error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"})
    }
}

const checkAnuntRights = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId || isNaN(userId)) {
            return res.status(404).json({message: "ID Utilizator invalid"});
        }
        const user = models.Utilizator.findByPk(userId);
        if(!user) {
            return res.status(404).json({message: "Missing user"});
        }
        return res.status(200).json({rights: user.poateCreaAnunt});
    }catch(error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export default {
    getForumuri,
    createForum,
    getUserForumRights,
    getMesajeForum,
    createMesajForum,
    getForumTitleAndStatus,
    getUserForumuri,
    changeForumTitle,
    toggleForumStatus
}