export default (sequelize, DataTypes) => {
    return sequelize.define('RecomandareAI', {
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
        descriereAI: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}