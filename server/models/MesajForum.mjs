export default (sequelize, DataTypes) => {
    return sequelize.define('MesajForum', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idForum: {
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