const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Budge = require("./Budge");
const configModel = require("./configModels");

const CategoryItem = db.define(
  "category_item",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    budge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Budge,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "categories_items",
    timestamps: false,
  }
);

CategoryItem.belongsTo(Budge,{
  foreignKey: 'budge_id',
  as: "budge"
})

CategoryItem.sync(configModel).then( () => {
  console.log(` > CategoryItem sincronizado con la base de datos`);
}).catch( () => {
  console.log(` > Error al sincronizar CategoryItem con la base de datos`);
})

module.exports = CategoryItem;
