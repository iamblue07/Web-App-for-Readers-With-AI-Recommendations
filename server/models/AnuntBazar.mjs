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
        dataAnunt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        pretAnunt: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        genLiterar: {
            type:DataTypes.STRING,
            allowNull: false
        },
        esteNegociabil: {
            type: DataTypes.BOOLEAN,
        },
        esteDisponibil: {
            type: DataTypes.BOOLEAN
        },
        caleImagine: {
            type: DataTypes.STRING,
            allowNull: true
        },
        idCarte: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: false
    })
}