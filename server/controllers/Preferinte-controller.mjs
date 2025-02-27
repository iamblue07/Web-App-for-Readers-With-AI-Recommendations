import models from '../models/index.mjs';
import dotenv from 'dotenv';
dotenv.config();

const getUtilizatorPreferinte = async (req, res) => {
    try{
        const idUtilizator = req.user.id;
        if(!idUtilizator) {
            return res.status(404).json({message: "Utilizator not found"})
        }
        const preferinte = await models.Preferinte.findOne({where: {idUtilizator}})
        if(!preferinte) {
            return res.status(404).json({message: "Preferinte not found"})
        }

        const preferinteData = {
            PreferintaUnu: preferinte.preferintaUnu,
            PreferintaDoi: preferinte.preferintaDoi,
            PreferintaTrei: preferinte.preferintaTrei,
            PreferintaPatru: preferinte.preferintaPatru,
            PreferintaCinci: preferinte.preferintaCinci
        };
        return res.status(200).json(preferinteData);

    }catch(error) {
        return res.status(500).json({message: "Internal server error"})
    }
}

const updateUtilizatorPreferinte = async (req, res) => {
    try {
        const idUtilizator = req.user.id;
        if(!idUtilizator) {
            return res.status(404).json({message: "Utilizator not found"})
        }
        const preferinte = await models.Preferinte.findOne({where: {idUtilizator}})
        if (!preferinte) {
            return res.status(404).json({message: "Preferinte not found"})
        }
        const newPreferinte = req.body.newPreferinte;

        if (newPreferinte.length === 5) {
            preferinte.preferintaUnu = newPreferinte[0];
            preferinte.preferintaDoi = newPreferinte[1];
            preferinte.preferintaTrei = newPreferinte[2];
            preferinte.preferintaPatru = newPreferinte[3];
            preferinte.preferintaCinci = newPreferinte[4];
        } else {
            return res.status(400).json({message: "Array-ul de preferinte trebuie să conțină exact 5 elemente"});
        }
        await preferinte.save();
        return res.status(200).json({message: "Preferintele au fost actualizate cu succes!"});

    }catch(error) {
        return res.status(500).json({message: "Internal server error"})
    }
}

export default {
    getUtilizatorPreferinte,
    updateUtilizatorPreferinte
}