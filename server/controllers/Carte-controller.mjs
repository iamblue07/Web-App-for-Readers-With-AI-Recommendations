import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import { Op } from "sequelize";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- API to get book IDs based on search criteria ---
const postCartiIDs = async (req, res) => {
    try {
        console.log("Received data:", req.body);
        const { searchWords, genuriSelectate, pretMinim, pretMaxim, currentPage, booksPerPage } = req.body;

        if (isNaN(pretMinim) || isNaN(pretMaxim)) {
            return res.status(400).json({ error: 'Preturile trebuie să fie numere valide.' });
        }

        const ofertaCarti = await models.OfertaCarte.findAll({
            attributes: ['idCarte'],
            where: {
                pretOferta: { [Op.between]: [pretMinim, pretMaxim] }
            }
        });

        const idList = ofertaCarti.map(oferta => oferta.idCarte);

        // Construct where clause for book search
        const whereClause = {
            id: { [Op.in]: idList },
            titlu: { [Op.like]: `%${searchWords}%` }
        };

        if (genuriSelectate.length > 0) {
            whereClause.genLiterar = { [Op.in]: genuriSelectate };
        }

        const cartiFiltrate = await models.Carte.findAll({
            attributes: ['id'],
            where: whereClause,
            limit: booksPerPage,  // Limit to booksPerPage
            offset: (currentPage - 1) * booksPerPage  // Offset for pagination
        });

        const totalBooks = await models.Carte.count({
            where: whereClause
        });

        const totalPages = Math.ceil(totalBooks / booksPerPage);  // Calculate total pages

        res.json({
            ids: cartiFiltrate.map(carte => carte.id),
            totalPages: totalPages
        });
    } catch (error) {
        console.error("Error in postCartiIDs:", error);
        res.status(500).json({ error: 'Eroare la preluarea datelor' });
    }
};


const getCartiData = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "IDs not an array, or empty." });
        }

        const carti = await models.Carte.findAll({
            where: { id: ids }
        });

        if (carti.length === 0) {
            return res.status(404).json({ message: "No books found for the given IDs." });
        }

        const cartiData = await Promise.all(carti.map(async (carte) => {
            const oferte = await models.OfertaCarte.findAll({
                where: { idCarte: carte.id }
            });

            const pretMinim = oferte.length > 0
                ? Math.min(...oferte.map(oferta => oferta.pretOferta))
                : 0;

            return {
                id: carte.id,
                titlu: carte.titlu,
                autor: carte.autor,
                isbn: carte.isbn,
                pretMinim: pretMinim
            };
        }));

        console.log("Final book details:", cartiData);

        return res.status(200).json(cartiData);
    } catch (error) {
        console.error("Error in getCartiData:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getCarteImagine = async(req, res) => {
    try {
        const carteId = req.params.carteId;
        if(!carteId || isNaN(carteId)) {
            return res.status(404).json({error: "ID carte invalid"})
        }
        const carte = await models.Carte.findByPk(carteId);
        if(!carte || !carte.caleImagine) {
            return res.status(404).json({error: "Cartea nu exista sau imaginea lipseste."})
        }
        const caleAbsoluta = path.resolve(carte.caleImagine);
        return res.sendFile(caleAbsoluta);
    }catch(error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

const getOneCarte = async(req, res) => {
    try {
        const carteId = req.params.idCarte;
        if(!carteId || isNaN(carteId)) {
            return res.status(404).json({error: "ID carte invalid"})
        }
        const carte = await models.Carte.findByPk(carteId);
        if(!carte) {
            return res.status(404).json({error: "Cartea nu exista"});
        }
        return res.status(200).json(carte);

    } catch(error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

const getOferteCarte = async(req, res) => {
    try{
        const carteId = req.params.idCarte;
        if(!carteId || isNaN(carteId)) {
            return res.status(404).json({error: "ID carte invalid"})
        }
        const oferte = await models.OfertaCarte.findAll({
            where: {idCarte: carteId}
        })
        return res.status(200).json(oferte);

    }catch(error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

const getCarteCitita = async(req, res) => {
    try {
        const userId = req.user.id;
        const carteId = req.params.idCarte;
        if(!carteId || isNaN(carteId) || !userId || isNaN(userId)) {
            return res.status(404).json({error:"ID carte sau utilizator invalid"})
        }
        const rez = await models.CarteCitita.findAll({
            where: {
                idUtilizator : userId,
                idCarte : carteId
            }
        })
        if(rez.length > 0) {
            return res.status(200).json({isRead: true})
        }
        return res.status(200).json({isRead: false})
    } catch(error){
        return res.status(500).json({error:"Internal server error"})
    }
}

const postMarcheazaCarteCitita = async(req, res) => {
    try {
        const userId = req.user.id;
        const carteId = req.params.idCarte;
        if(!carteId || isNaN(carteId) || !userId || isNaN(userId)) {
            return res.status(404).json({error:"ID carte sau utilizator invalid"})
        }
        const rez = await models.CarteCitita.findAll({
            where: {
                idUtilizator : userId,
                idCarte : carteId
            }
        })
        if(rez.length > 0) {
            return res.status(400).json({error: "Book already marked"})
        }
        else {
            await models.CarteCitita.create({
                idUtilizator: userId,
                idCarte: carteId
            })
            return res.status(200).json({Marked: true})
        }
    } catch(error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

const postDemarcheazaCarteCitita = async(req, res) => {
    try{
        const userId = req.user.id;
        const carteId = req.params.idCarte;
        if(!carteId || isNaN(carteId) || !userId || isNaN(userId)) {
            return res.status(404).json({error:"ID carte sau utilizator invalid"})
        }
        const rez = await models.CarteCitita.destroy({
            where: {
                idUtilizator : userId,
                idCarte : carteId
            }
        })
        if(rez > 0) {
            return res.status(200).json({Marked: false})
        } else {
            return res.status(400).json({error: "Inregistrarea nu exista!"})
        }
    }catch(error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

export default {
    getCarteImagine,
    postCartiIDs,
    getCartiData,
    getOneCarte,
    getOferteCarte,
    getCarteCitita,
    postMarcheazaCarteCitita,
    postDemarcheazaCarteCitita
};
