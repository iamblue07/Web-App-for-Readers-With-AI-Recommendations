export default (sequelize, DataTypes) => {
    return sequelize.define('Raport', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idAdministrator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idMesaj: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        descriere: {
            type: DataTypes.STRING,
            allowNull: false
        },
        esteDeschis: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: false
    })
}