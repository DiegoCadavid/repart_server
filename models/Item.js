const { DataTypes } = require("sequelize");
const db = require("../database/connection");

const Product = require("./Product");
const Budge = require("./Budge");
const CategoryItem = require("./CategoryItem");
const { modelSync } = require("./configModels");

const Item = db.define(
  "item",
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    budge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Budge,
        key: "id",
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CategoryItem,
        key: "id",
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
  }
);

Item.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Item.belongsTo(Budge, {
  foreignKey: "budge_id",
  as: "budge",
});
Item.belongsTo(CategoryItem, {
  foreignKey: "category_id",
  as: "category",
});


modelSync(Item);


module.exports = Item;
