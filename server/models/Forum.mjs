export default (sequelize, DataTypes) => {
    return sequelize.define('Forum', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        titluForum: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.DATE,
            allowNull: false 
        },
        esteDeschis: {
            type: DataTypes.BOOLEAN
        },
        idUtilizator: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    })
}