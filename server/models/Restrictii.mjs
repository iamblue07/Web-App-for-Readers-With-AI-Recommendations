export default (sequelize, DataTypes) => {
    return sequelize.define('Restrictii', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        restrictie: {
            type: DataTypes.STRING,
            allowNull: false
        },
        termenExpirare: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}