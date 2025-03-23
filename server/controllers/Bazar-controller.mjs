import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Op } from "sequelize";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";

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
        anuntPret, anuntNegociabil, anuntIdCarte, genLiterar} = req.body;
        if(!req.file) {
            return res.status(400).json({message:"Niciun fisier incarcat!"});
        }
        const imagePath = `uploads/${req.file.filename}`;
        await models.AnuntBazar.create({
            genLiterar: genLiterar, 
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

const postAnuntBazarIDs = async (req, res) => {
  try {
    console.log("Received data: ", req.body);
    const {
      stringCautare,
      pretMinim,
      pretMaxim,
      categorieSelectata,
      sortareSelectata,
      currentPage,
      anunturiPerPage
    } = req.body;

    if (isNaN(pretMinim) || isNaN(pretMaxim)) {
      return res.status(400).json({ error: 'Preturile trebuie sa fie numere valide' });
    }

    const whereClause = {
      pretAnunt: { [Op.between]: [pretMinim, pretMaxim] },
      esteDisponibil: true
    };

    if (categorieSelectata && categorieSelectata !== "Alege categoria") {
      whereClause.genLiterar = categorieSelectata;
    }

    if (stringCautare && stringCautare.trim() !== '') {
      whereClause.titluAnunt = { [Op.like]: `%${stringCautare}%` };
    }

    let orderClause = [];
    if (sortareSelectata && sortareSelectata !== "Sorteaza dupa") {
      switch (sortareSelectata) {
        case "Pret - descrescator":
          orderClause.push(['pretAnunt', 'DESC']);
          break;
        case "Pret - crescator":
          orderClause.push(['pretAnunt', 'ASC']);
          break;
        case "Cele mai vechi anunturi":
          orderClause.push(['dataAnunt', 'ASC']);
          break;
        case "Cele mai noi anunturi":
          orderClause.push(['dataAnunt', 'DESC']);
          break;
        default:
          break;
      }
    }

    const offset = (currentPage - 1) * anunturiPerPage;

    const result = await models.AnuntBazar.findAndCountAll({
      attributes: ['id'],
      where: whereClause,
      order: orderClause,
      limit: anunturiPerPage,
      offset: offset
    });

    const idList = result.rows.map(anunt => anunt.id);
    const totalPages = Math.ceil(result.count / anunturiPerPage);

    return res.status(200).json({ ids: idList, totalPages });
  } catch (error) {
    console.error("Error in postAnuntBazarIDs: ", error);
    res.status(500).json({ error: 'Eroare la preluarea datelor' });
  }
};

const getAnunturiData = async (req, res) => {
  try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ message: "IDs not an array, or empty" });
      }

      const anunturi = await models.AnuntBazar.findAll({
          where: { id: ids },
          order: [[Sequelize.fn('FIELD', Sequelize.col('AnuntBazar.id'), ...ids), 'ASC']],
          include: [{ model: models.Utilizator, attributes: ['username'] }]
      });

      if (anunturi.length === 0) {
          return res.status(404).json({ message: "No Anunturi found for the given IDs" });
      }

      const anunturiData = anunturi.map(anunt => ({
          id: anunt.id,
          titlu: anunt.titluAnunt,
          descriere: anunt.descriereAnunt,
          utilizator: anunt.Utilizator ? anunt.Utilizator.username : "Utilizator necunoscut",
          data: anunt.dataAnunt,
          negociabil: anunt.esteNegociabil,
          pret: anunt.pretAnunt
      }));

      console.log("Final anunturi details: ", anunturiData);
      return res.status(200).json(anunturiData);
  } catch (error) {
      console.error("Error in getAnunturiData:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


const getAnuntImagine = async(req, res) => {
  try {
    const anuntId = req.params.anuntId;
    if(!anuntId || isNaN(anuntId)) {
      return res.status(404).json({error: "ID anunt invalid"})
    }
    const anunt = await models.AnuntBazar.findByPk(anuntId);
    if(!anunt || !anunt.caleImagine) {
      return res.status(404).json({error: "Imaginea nu exista sau imaginea lipseste"});
    }
    const caleAbsoluta = path.resolve(anunt.caleImagine);
    return res.sendFile(caleAbsoluta);
  }catch(error) {
    return res.status(500).json({error: "Internal server error"})
  }
}

const getAnunturileMeleIDs = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "ID utilizator invalid" });
    }

    const { count, rows } = await models.AnuntBazar.findAndCountAll({
      where: { idUtilizator: userId },
      attributes: ["id"],
      order: [["dataAnunt", "DESC"]]
    });

    return res.status(200).json({ totalAnunturi: count, anunturiIds: rows.map(anunt => anunt.id) });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAnuntData = async (req, res) => {
  try{
    const anuntId = req.params.anuntId;
    const anunt = await models.AnuntBazar.findByPk(anuntId);
    if(!anunt){
      console.log(anuntId);
      return res.status(404).json({error:"Could not find requested anunt"});
    }
    return res.status(200).json(anunt);
  }catch(error){
    return res.status(500).json({error: "Internal Server Error"});
  }
}

const postUpdateAnunt = async (req, res) => {
  try{
    const userId = req.user.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "ID utilizator invalid" });
    }
    const {id, pretNou, esteNegociabil } = req.body;
    if(!id) {
      return res.status(404).json({error:"Missing ID"});
    }
    const anunt = await models.AnuntBazar.findByPk(id);
    if(!anunt){
      return res.status(404).json({error:"Could not find requested anunt"});
    }
    if(anunt.idUtilizator !== userId) {
      return res.status(400).json({error: "User ID not matching with the connected users'"});
    }
    anunt.esteNegociabil = esteNegociabil;
    anunt.pretAnunt = pretNou;
    await anunt.save();
    return res.status(200).json({message:"Succes"});
  }catch(error){
    return res.status(500).json({error: "Internal server error"});
  }
}

const postInchideAnunt = async(req, res) => {
  try{
    const userId = req.user.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "ID utilizator invalid" });
    }
    const anuntID = req.params.anuntId;
    if(!anuntID) {
      return res.status(404).json({error:"Missing ID"});
    }
    const anunt = await models.AnuntBazar.findByPk(anuntID);
    if(!anunt){
      return res.status(404).json({error:"Could not find requested anunt"});
    }
    if(anunt.idUtilizator !== userId) {
      return res.status(400).json({error: "User ID not matching with the connected users'"});
    }
    anunt.esteDisponibil = false;
    await anunt.save();
    console.log(anunt);
    return res.status(200).json({message: "Succes"});
  }catch(error){
    return res.status(500).json({error: "Internal server error"});
  }
}

const postStergeAnunt = async(req, res) => {
  try{
    const userId = req.user.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "ID utilizator invalid" });
    }
    const anuntID = req.params.anuntId;
    if(!anuntID) {
      return res.status(404).json({error:"Missing ID"});
    }
    const anunt = await models.AnuntBazar.findByPk(anuntID);
    if(!anunt){
      return res.status(404).json({error:"Could not find requested anunt"});
    }
    if(anunt.idUtilizator !== userId) {
      return res.status(400).json({error: "User ID not matching with the connected users'"});
    }
    if(anunt.caleImagine) {
      const caleVeche = path.join(__dirname, '..', anunt.caleImagine);
      if(fs.existsSync(caleVeche)) {
        fs.unlinkSync(caleVeche);
      }
    }
    await anunt.destroy();
    console.log(anunt);
    return res.status(200).json({message: "Succes"});
  }catch(error){
    return res.status(500).json({error: "Internal server error"});
  }
}

const getAnunturiIDs = async(req, res) => {
  try {
    const carteID = req.params.carteID;
    if(!carteID) {
      return res.status(404).json({error:"Missing carte ID"});
    }
    const { count, rows } = await models.AnuntBazar.findAndCountAll({
      where: { idCarte: carteID },
      attributes: ["id"],
      order: [["dataAnunt", "DESC"]]
    });

    return res.status(200).json({ totalAnunturi: count, anunturiIds: rows.map(anunt => anunt.id) });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const getSellerData = async(req, res) => {
  try{
    const anuntID = req.params.idAnunt;
    if(!anuntID) {
      return res.status(404).json({error:"Missing Anunt ID"});
    }
    const anunt = await models.AnuntBazar.findByPk(anuntID, {
      attributes: ["idUtilizator"]
    })
    if(!anunt.idUtilizator) {
      return res.status(404).json({error:"Missing utilizator ID"});
    }
    const utilizatorData = await models.Utilizator.findByPk(anunt.idUtilizator, {
      attributes: ["username"]
    })
    return res.status(200).json(utilizatorData);
  }catch(error){
    return res.status(500).json({error:"Internal Server Error"})
  }
}

const checkOwning = async (req, res) => {
    try{
      const userId = req.user.id;
      const {anuntID} = req.params;

      if(!userId || !anuntID) {
        return res.status(404).json({error:"Missing IDs"});
      }

      const anunt = await models.AnuntBazar.findByPk(anuntID);
      if(!anunt) {
        return res.status(404).json({error:"Missing Anunt"});
      }

      const isOwning = anunt.idUtilizator === userId;
      console.log(isOwning);
      console.log(anunt.idUtilizator)
      console.log(userId);
      return res.status(200).json({isOwning});

    }catch(error){
      return res.status(500).json({error:"Internal Server Error"})
    }
}

export default {
    getCartiDataShort,
    getAnuntRights,
    createAnunt,
    postAnuntBazarIDs,
    getAnunturiData,
    getAnuntImagine,
    getAnunturileMeleIDs,
    getAnuntData,
    postUpdateAnunt,
    postInchideAnunt,
    postStergeAnunt,
    getAnunturiIDs,
    getSellerData,
    checkOwning
}