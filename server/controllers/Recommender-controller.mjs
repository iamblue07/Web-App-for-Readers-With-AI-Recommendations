import models from '../models/index.mjs';
import dotenv from 'dotenv';
dotenv.config();

const buildAndSendRecommendations = async (req, res) => {
    try {
        const idUtilizator = req.user.id;
        if (!idUtilizator) {
            return res.status(404).json({ message: "Utilizator not found" });
        }

        const preferinte = await models.Preferinte.findOne({
            where: { idUtilizator }
        });
        if (!preferinte) {
            return res.status(404).json({ message: "Preferințe not found" });
        }
        const explicitGenres = [
            preferinte.preferintaUnu,
            preferinte.preferintaDoi,
            preferinte.preferintaTrei,
            preferinte.preferintaPatru,
            preferinte.preferintaCinci
        ].filter(g => g);

        const cartiCitite = await models.CarteCitita.findAll({
            where: { idUtilizator },
            include: [{
                model: models.Carte,
                attributes: [
                    'genLiterar',
                    'anger_score', 'disgust_score', 'fear_score',
                    'joy_score', 'sadness_score', 'surprise_score', 'neutral_score'
                ]
            }]
        });

        const genreAcc = {};
        cartiCitite.forEach(({ scor, Carte }) => {
            const gen = Carte.genLiterar || 'Unknown';
            if (!genreAcc[gen]) {
                genreAcc[gen] = { sum: 0, count: 0 };
            }
            genreAcc[gen].sum += scor;
            genreAcc[gen].count += 1;
        });
        const implicitGenres = Object.entries(genreAcc).map(([genre, { sum, count }]) => ({
            genre,
            avgScore: sum / count
        }));

        const BOOST = 1.2;
        const merged = implicitGenres.reduce((acc, { genre, avgScore }) => {
            acc[genre] = avgScore;
            return acc;
        }, {});
        explicitGenres.forEach(g => {
            const current = merged[g] || 0;
            merged[g] = current * BOOST;
        });

        const sortedGenres = Object.entries(merged)
            .sort(([, a], [, b]) => b - a)
            .map(([genre]) => genre);

        let sentiment;
        const highRated = cartiCitite.filter(rc => rc.scor >= 4).map(rc => rc.Carte);
        if (highRated.length) {
            const totals = highRated.reduce((t, b) => {
                t.anger += b.anger_score     || 0;
                t.disgust += b.disgust_score || 0;
                t.fear += b.fear_score       || 0;
                t.joy += b.joy_score         || 0;
                t.sadness += b.sadness_score || 0;
                t.surprise += b.surprise_score || 0;
                t.neutral += b.neutral_score || 0;
                return t;
            }, { anger:0, disgust:0, fear:0, joy:0, sadness:0, surprise:0, neutral:0 });
            sentiment = Object.entries(totals)
                .sort(([, a], [, b]) => b - a)[0][0];
        }

        const topGenres = sortedGenres.slice(0, 3);
        const query = `Literatura moderna despre ${topGenres.join(', ')}`;

        const payload = {
                query,
                top_k: 16,
                ...(sentiment && { sentiment })
            };
        const response = await fetch(
            `${process.env.RECOMMENDER_URL}/api/request-recommendations`,
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': req.headers.authorization},
                body: JSON.stringify(payload)
            }
        );

        return res.status(200).json(response.data);

    } catch (error) {
        console.error(`Error building recommendations:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default {
    buildAndSendRecommendations
};
