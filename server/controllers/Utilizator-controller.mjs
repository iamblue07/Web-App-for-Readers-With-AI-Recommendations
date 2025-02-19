import { Op } from 'sequelize';
import models from '../models/index.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const salt = await bcrypt.genSalt(10);

const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await models.Utilizator.findOne({ where: { email } });
        if (user) {
            return res.status(200).json({ exists: true });
        }
        return res.status(200).json({ exists: false });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const checkUsernameTaken = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await models.Utilizator.findOne({ where: { username } });
        if (user) {
            return res.status(200).json({ taken: true });
        }
        return res.status(200).json({ taken: false });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const createUtilizator = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await models.Utilizator.create({
            email,
            username,
            parolaHash: passwordHash,
            dataInregistrare: new Date(),
            poateCreaAnunt: true,
            poateCreaForum: true,
            poateTrimiteMesaj: true,
            esteAdministrator: false
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

        return res.status(201).json({ user: newUser, token });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const loginUtilizator = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find the user by email
        const user = await models.Utilizator.findOne({ where: { email } });
        
        // If the user doesn't exist
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.parolaHash);

        // If password doesn't match
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

        // If user and password are valid
        return res.status(200).json({ user, token });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export { checkEmailExists, checkUsernameTaken, createUtilizator, loginUtilizator };

