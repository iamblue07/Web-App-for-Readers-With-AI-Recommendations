import Sequelize from 'sequelize';

import CreateAnuntBazarEntity from './AnuntBazar.mjs';
import CreateCarteEntity from './Carte.mjs';
import CreateCarteCititaEntity from './CarteCitita.mjs';
import CreateChatBazarEntity from './ChatBazar.mjs';
import CreateForumEntity from './Forum.mjs';
import CreateMesajForumEntity from './MesajForum.mjs';
import CreateMesajChatEntity from './MesajChat.mjs';
import CreateOfertaCarteEntity from './OfertaCarte.mjs';
import CreatePreferinteEntity from './Preferinte.mjs';
import CreateRaportEntity from './Raport.mjs';
import CreateRecomandareAIEntity from './RecomandareAI.mjs';
import CreateUtilizatorEntity from './Utilizator.mjs';

const sequelize = new Sequelize('LicentaDB', 'root', 'admin', {
    host: "localhost",
    port: 3307,
    dialect: "mysql"
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL!');
    } catch (error) {
        console.error('Unable to connect:', error);
    }
})();

const AnuntBazar = CreateAnuntBazarEntity(sequelize, Sequelize);
const Carte = CreateCarteEntity(sequelize, Sequelize);
const CarteCitita = CreateCarteCititaEntity(sequelize, Sequelize);
const ChatBazar = CreateChatBazarEntity(sequelize, Sequelize);
const Forum = CreateForumEntity(sequelize, Sequelize);
const MesajForum = CreateMesajForumEntity(sequelize, Sequelize);
const MesajChat = CreateMesajChatEntity(sequelize, Sequelize);
const OfertaCarte = CreateOfertaCarteEntity(sequelize, Sequelize);
const Preferinte = CreatePreferinteEntity(sequelize, Sequelize);
const Raport = CreateRaportEntity(sequelize, Sequelize);
const RecomandareAI = CreateRecomandareAIEntity(sequelize, Sequelize);
const Utilizator = CreateUtilizatorEntity(sequelize, Sequelize);


// --- Relații pentru Forum și Mesaje ---
Forum.hasMany(MesajForum, { foreignKey: 'idForum' });
MesajForum.belongsTo(Forum, { foreignKey: 'idForum' });

ChatBazar.hasMany(MesajChat, { foreignKey: 'idChat' });
MesajChat.belongsTo(ChatBazar, { foreignKey: 'idChat' });

// --- Relații pentru Bazar ---
AnuntBazar.hasMany(ChatBazar, { foreignKey: 'idAnunt' });
ChatBazar.belongsTo(AnuntBazar, { foreignKey: 'idAnunt' });

Utilizator.hasMany(AnuntBazar, { foreignKey: 'idUtilizator' });
AnuntBazar.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

// --- Relații pentru Preferințe și Rapoarte ---
Utilizator.hasOne(Preferinte, { foreignKey: 'idUtilizator' });
Preferinte.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

Utilizator.hasMany(Raport, { foreignKey: 'idRaportor' });
Raport.belongsTo(Utilizator, { foreignKey: 'idRaportor' });

// --- Relații pentru Recomandare AI ---
Utilizator.hasOne(RecomandareAI, { foreignKey: 'idUtilizator' });
RecomandareAI.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

// --- Relații pentru Forum și Mesaje Forum ---
Utilizator.hasMany(Forum, { foreignKey: 'idUtilizator' });
Forum.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

Utilizator.hasMany(MesajForum, { foreignKey: 'idUtilizator' });
MesajForum.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

Utilizator.hasMany(MesajChat, { foreignKey: 'idUtilizator' });
MesajChat.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

// --- Relații pentru Cărți și Utilizatori ---
Utilizator.hasMany(CarteCitita, { foreignKey: 'idUtilizator' });
CarteCitita.belongsTo(Utilizator, { foreignKey: 'idUtilizator' });

Carte.hasMany(CarteCitita, { foreignKey: 'idCarte' });
CarteCitita.belongsTo(Carte, { foreignKey: 'idCarte' });

// --- Relații pentru Ofertele de Cărți ---
Carte.hasMany(OfertaCarte, { foreignKey: 'idCarte' });
OfertaCarte.belongsTo(Carte, { foreignKey: 'idCarte' });

// --- Relații pentru Recomandare AI și Cărți ---
Carte.hasMany(RecomandareAI, { foreignKey: 'idCarte' });
RecomandareAI.belongsTo(Carte, { foreignKey: 'idCarte' });

// Sincronizare baza de date
(async () => {
    try {
        await sequelize.sync({ alter: false, force: false });
        console.log('Database synchronized successfully.');
    } catch (err) {
        console.error('Failed to synchronize database:', err);
    }
})();

export default {
    sequelize,
    AnuntBazar,
    Carte,
    CarteCitita,
    ChatBazar,
    Forum,
    MesajForum,
    MesajChat,
    OfertaCarte,
    Preferinte,
    Raport,
    RecomandareAI,
    Utilizator
};
