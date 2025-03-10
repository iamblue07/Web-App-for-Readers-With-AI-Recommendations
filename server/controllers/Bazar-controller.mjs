import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
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

    // Build the filtering criteria
    const whereClause = {
      pretAnunt: { [Op.between]: [pretMinim, pretMaxim] },
      esteDisponibil: true
    };

    // Only filter by category if a valid category is selected
    if (categorieSelectata && categorieSelectata !== "Alege categoria") {
      whereClause.genLiterar = categorieSelectata;
    }

    // Add search condition for titluAnunt if stringCautare is provided (non-empty)
    if (stringCautare && stringCautare.trim() !== '') {
      whereClause.titluAnunt = { [Op.like]: `%${stringCautare}%` };
    }

    // Build the ordering criteria
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
          // If none of the expected values match, no ordering is applied.
          break;
      }
    }

    // Calculate offset for pagination (currentPage is assumed to be 1-indexed)
    const offset = (currentPage - 1) * anunturiPerPage;

    // Use findAndCountAll to both fetch rows and count the total results for pagination
    const result = await models.AnuntBazar.findAndCountAll({
      attributes: ['id'],
      where: whereClause,
      order: orderClause,
      limit: anunturiPerPage,
      offset: offset
    });

    const idList = result.rows.map(anunt => anunt.id);
    const totalPages = Math.ceil(result.count / anunturiPerPage);

    // Return the fetched ids and total pages
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


export default {
    getCartiDataShort,
    getAnuntRights,
    createAnunt,
    postAnuntBazarIDs,
    getAnunturiData,
    getAnuntImagine
}