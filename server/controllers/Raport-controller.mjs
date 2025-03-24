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
            idRaportor: userId
        })
        return res.status(200).json({message: "Success"});
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export default {
    creeazaRaport
}