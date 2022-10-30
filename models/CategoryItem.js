const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Budge = require("./Budge");

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

module.exports = CategoryItem;
