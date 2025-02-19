export default (sequelize, DataTypes) => {
    return sequelize.define('OfertaCarte', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isbn: {
            type: DataTypes.STRING,
            allowNull: false
        },
        magazin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        linkOferta: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false
    })
}