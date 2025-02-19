export default (sequelize, DataTypes) => {
    return sequelize.define('Preferinte', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        genLiterar: {
            type: DataTypes.STRING,
            allowNull: false
        },
        estePreferat: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}