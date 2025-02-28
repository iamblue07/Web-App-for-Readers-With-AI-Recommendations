import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import { Op } from "sequelize";

dotenv.config();

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

            const caleImagineAbsoluta = carte.caleImagine
                ? path.resolve(__dirname, 'uploads', carte.caleImagine)
                : null;

            return {
                titlu: carte.titlu,
                autor: carte.autor,
                isbn: carte.isbn,
                caleImagineAbsoluta: caleImagineAbsoluta,
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

export default {
    postCartiIDs,
    getCartiData
};
