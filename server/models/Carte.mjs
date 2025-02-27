export default (sequelize, DataTypes) => {
    return sequelize.define('Carte', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isbn: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        titlu: {
            type: DataTypes.STRING,
            allowNull: false
        },
        autor: {
            type: DataTypes.STRING,
            allowNull: false
        },
        genLiterar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        caleImagine: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false
    });
};
