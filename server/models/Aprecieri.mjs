export default (sequelize, DataTypes) => {
    return sequelize.define('Aprecieri', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idCarte: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        imiPlace: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        imiDisplace: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}