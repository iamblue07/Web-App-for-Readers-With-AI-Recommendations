export default (sequelize, DataTypes) => {
    return sequelize.define('MesajChat', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idChat: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        continut: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}