export default (sequelize, DataTypes) => {
    return sequelize.define('Raport', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        obiectRaport: {
            type:DataTypes.STRING,
            allowNull: false
        },
        idObiect: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        descriere: {
            type: DataTypes.STRING,
            allowNull: false
        },
        esteDeschis: {
            type:DataTypes.BOOLEAN,
            allowNull: false,
        },
        idRaportor: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dataRaport: {
            type: DataTypes.DATE,
            allowNull:false
        }

    }, {
        timestamps: false
    })
}