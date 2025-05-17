import models from "../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import { QueryTypes, Op } from "sequelize";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postCartiIDs = async (req, res) => {
    try {
      const {
        searchWords = '',
        genuriSelectate = [],
        pretMinim,
        pretMaxim,
        currentPage = 1,
        booksPerPage = 10,
        sortareSelectata
      } = req.body;
  
      if (isNaN(pretMinim) || isNaN(pretMaxim)) {
        return res.status(400).json({ error: 'Preturile trebuie să fie numere valide.' });
      }
  
      const offset = (currentPage - 1) * booksPerPage;
      const replacements = {
        pretMinim,
        pretMaxim,
        searchWordsPattern: `%${searchWords}%`,
        genres: genuriSelectate,
        limit: booksPerPage,
        offset
      };
  
      const genreFilter = genuriSelectate.length
        ? 'AND c.`genLiterar` IN (:genres)'
        : '';
  
      let orderClause = '';
      switch (sortareSelectata) {
        case 'Pret - crescator':
          orderClause = 'ORDER BY oferta_min.`minPret` ASC';
          break;
        case 'Pret - descrescator':
          orderClause = 'ORDER BY oferta_min.`minPret` DESC';
          break;
        case 'Alfabetic - crescator':
          orderClause = 'ORDER BY c.`titlu` ASC';
          break;
        case 'Alfabetic - descrescator':
          orderClause = 'ORDER BY c.`titlu` DESC';
          break;
      }
  
      const sqlFetch = `
        SELECT c.\`id\`
        FROM \`Cartes\` AS c
        JOIN (
          SELECT \`idCarte\`, MIN(\`pretOferta\`) AS \`minPret\`
          FROM \`OfertaCartes\`
          GROUP BY \`idCarte\`
          HAVING MIN(\`pretOferta\`) BETWEEN :pretMinim AND :pretMaxim
        ) AS \`oferta_min\` ON \`oferta_min\`.\`idCarte\` = c.\`id\`
        WHERE c.\`titlu\` LIKE :searchWordsPattern
          ${genreFilter}
          ${orderClause}
        LIMIT :limit
        OFFSET :offset;
      `;
      const rows = await models.sequelize.query(sqlFetch, {
        replacements,
        type: QueryTypes.SELECT
      });
      const ids = rows.map(r => r.id);
  
      const sqlCount = `
        SELECT COUNT(*) AS \`count\`
        FROM \`Cartes\` AS c
        JOIN (
          SELECT \`idCarte\`
          FROM \`OfertaCartes\`
          GROUP BY \`idCarte\`
          HAVING MIN(\`pretOferta\`) BETWEEN :pretMinim AND :pretMaxim
        ) AS \`oferta_min\` ON \`oferta_min\`.\`idCarte\` = c.\`id\`
        WHERE c.\`titlu\` LIKE :searchWordsPattern
          ${genreFilter};
      `;
      const countResult = await models.sequelize.query(sqlCount, {
        replacements,
        type: QueryTypes.SELECT
      });
      const totalBooks = parseInt(countResult[0].count, 10);
      const totalPages = Math.ceil(totalBooks / booksPerPage);
  
      return res.json({ ids, totalPages });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Eroare la preluarea datelor' });
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

        return res.status(200).json(cartiData);
    } catch (error) {
        console.error("Error in getCartiData:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



import http from 'http';
import https from 'https';
import { URL } from 'url';

const getCarteImagine = async (req, res) => {
    try {
        const carteId = req.params.carteId;
        if (!carteId || isNaN(carteId)) {
            return res.status(404).json({ error: "ID carte invalid" });
        }

        const carte = await models.Carte.findByPk(carteId);
        if (!carte || !carte.caleImagine) {
            return res.status(404).json({ error: "Cartea nu exista sau imaginea lipseste." });
        }

        let isUrl = false;
        let urlObj;

        try {
            urlObj = new URL(carte.caleImagine);
            isUrl = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (_) {
            isUrl = false;
        }

        if (isUrl) {
            const client = urlObj.protocol === 'https:' ? https : http;
            client.get(urlObj, (urlRes) => {
                if (urlRes.statusCode !== 200) {
                    return res.status(404).json({ error: "Imaginea nu a putut fi obținută de la URL." });
                }

                res.setHeader('Content-Type', urlRes.headers['content-type'] || 'image/jpeg');
                urlRes.pipe(res);
            }).on('error', (err) => {
                console.error(err);
                return res.status(500).json({ error: "Eroare la obținerea imaginii de la URL." });
            });
        } else {
            const caleAbsoluta = path.resolve(carte.caleImagine);
            return res.sendFile(caleAbsoluta);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


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
        const rating = req.body.rating;
        if(rating < 0 || rating > 5) {
            return res.status(401).json({error:"Forbidden score"})
        }
        if(!carteId || isNaN(carteId) || !userId || isNaN(userId)) {
            return res.status(404).json({error:"ID carte sau utilizator invalid"})
        }
        const rez = await models.CarteCitita.findOne({
            where: {
                idUtilizator : userId,
                idCarte : carteId
            }
        })
        if(rez) {
            rez.scor = rating;
            await rez.save();
            return res.status(200).json({Marked: true})
        }
        else {
            await models.CarteCitita.create({
                idUtilizator: userId,
                idCarte: carteId,
                scor: rating
            })
            return res.status(200).json({Marked: true})
        }
    } catch(error) {
        console.log(error);
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

const getUtilizatorIstoric = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || isNaN(userId)) {
            return res.status(404).json({ error: "ID Utilizator invalid" });
        }

        const istoric = await models.CarteCitita.findAll({
            where: { idUtilizator: userId },
            include: [
                {
                    model: models.Carte,
                    attributes: ['id', 'titlu', 'autor']
                }
            ]
        });

        const istoricFormatat = istoric.map(entry => ({
            idCarte: entry.Carte.id,
            titlu: entry.Carte.titlu,
            autor: entry.Carte.autor
        }));

        return res.status(200).json(istoricFormatat);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export default {
    getCarteImagine,
    postCartiIDs,
    getCartiData,
    getOneCarte,
    getOferteCarte,
    getCarteCitita,
    postMarcheazaCarteCitita,
    postDemarcheazaCarteCitita,
    getUtilizatorIstoric
};
