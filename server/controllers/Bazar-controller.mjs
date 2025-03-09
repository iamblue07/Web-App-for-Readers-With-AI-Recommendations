import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import { Op } from "sequelize";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getCartiDataShort = async (req, res) => {
    try {
        const { keywords } = req.body;

        if (keywords && keywords.trim() !== "") {
            const carti = await models.Carte.findAll({
                where: {
                    titlu: { [Op.like]: `%${keywords}%` }
                },
                attributes: ["id", "titlu", "autor", "genLiterar"],
            });

            const data = carti.map((carte) => ({
                idCarte: carte.id,
                titlu: carte.titlu,
                autor: carte.autor,
                gen: carte.genLiterar,
            }));

            return res.status(200).json(data);
        }

        return res.status(200).json([]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAnuntRights = async(req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || isNaN(userId)) {
            return res.status(404).json({ error: "ID utilizator invalid" });
        }        
        const user = await models.Utilizator.findByPk(userId);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({hasRights: user.poateCreaAnunt});
    } catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
}

const createAnunt = async(req, res) => {
    try{
        const userId = req.user.id;
        if (!userId || isNaN(userId)) {
            return res.status(404).json({ error: "ID utilizator invalid" });
        }
        const {anuntTitle, anuntDescriere, anuntData,
        anuntPret, anuntNegociabil, anuntIdCarte} = req.body;
        if(!req.file) {
            return res.status(400).json({message:"Niciun fisier incarcat!"});
        }
        const imagePath = `uploads/${req.file.filename}`;
        await models.AnuntBazar.create({
            idUtilizator: userId,
            titluAnunt: anuntTitle,
            descriereAnunt: anuntDescriere,
            dataAnunt: anuntData,
            pretAnunt: anuntPret,
            esteNegociabil: anuntNegociabil,
            esteDisponibil: true,
            caleImagine: imagePath,
            idCarte: anuntIdCarte
        })
        return res.status(200).json({message: "Anunt creat cu succes!"});
    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
}

export default {
    getCartiDataShort,
    getAnuntRights,
    createAnunt
}