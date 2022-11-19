const { DataTypes } = require("sequelize");
const db = require("../database/connection");

const User = require("./User");
const ConstructionImage = require("./ConstructionImage");

const configModel = require("./configModels");

const Construction = db.define(
  "Construction",
  {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    info: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    create_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    header_id :{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      references: {
        model: ConstructionImage,
        key: "id"
      }
    }
  },
  {
    timestamps: false,
  }
);

Construction.belongsTo(User, {
  foreignKey: 'client_id',
  as: "client"
});

Construction.belongsTo(User,{
  foreignKey: 'create_by',
  as: "creator"
})

Construction.belongsTo(ConstructionImage, {
  foreignKey: "header_id",
  as: "header"
})

Construction.sync(configModel).then( () => {
  console.log(` > Construction sincronizado con la base de datos`);
}).catch( () => {
  console.log(` > Error al sincronizar Construction con la base de datos`);
})

module.exports = Construction;
