export default (sequelize, DataTypes) => {
    return sequelize.define('Utilizator', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        parolaHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        descriere: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dataInregistrare: {
            type: DataTypes.DATE,
            allowNull: false
        },
        poateCreaAnunt: {
            type: DataTypes.BOOLEAN
        },
        poateCreaForum: {
            type: DataTypes.BOOLEAN
        },
        poateTrimiteMesaj: {
            type: DataTypes.BOOLEAN
        },
        poateRaporta: {
            type:DataTypes.BOOLEAN
        },
        esteAdministrator: {
            type: DataTypes.BOOLEAN
        },
        caleImagineProfil: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false
    })
}