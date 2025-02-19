export default (sequelize, DataTypes) => {
    return sequelize.define('AnuntBazar', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        titluAnunt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descriereAnunt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pretAnunt: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        esteDisponibil: {
            type: DataTypes.BOOLEAN
        },
    }, {
        timestamps: false
    })
}