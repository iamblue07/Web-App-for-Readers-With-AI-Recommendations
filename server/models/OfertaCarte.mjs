export default (sequelize, DataTypes) => {
    return sequelize.define('OfertaCarte', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idCarte: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Cartes',
                key: 'id'
            }
        },
        magazin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        linkOferta: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pretOferta: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0
        }
    }, {
        timestamps: false
    });
};
