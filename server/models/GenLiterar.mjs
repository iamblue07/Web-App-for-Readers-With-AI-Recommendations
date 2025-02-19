export default (sequelize, DataTypes) => {
    return sequelize.define('GenLiterar', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        genLiterar: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idCarte: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}