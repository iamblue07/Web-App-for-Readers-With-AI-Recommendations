export default (sequelize, DataTypes) => {
    return sequelize.define('Preferinte', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idUtilizator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        preferintaUnu: {
            type:DataTypes.STRING,
            allowNull: false
        }
        ,
        preferintaDoi: {
            type:DataTypes.STRING,
            allowNull: false
        }
        ,
        preferintaTrei: {
            type:DataTypes.STRING,
            allowNull: false
        }
        ,
        preferintaPatru: {
            type:DataTypes.STRING,
            allowNull: false
        }
        ,
        preferintaCinci: {
            type:DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    })
}