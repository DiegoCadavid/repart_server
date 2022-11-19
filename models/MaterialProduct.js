const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const {modelSync} = require("./configModels");

const Material = require("./Material");
const Product = require("./Product");

const MaterialProduct = db.define(
  "material_product",
  {
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Material,
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "materials_products",
    timestamps: false,
  }
);

MaterialProduct.belongsTo(Material,{
  foreignKey: "material_id",
  as: "material"
})

MaterialProduct.belongsTo(Product,{
  foreignKey: "product_id",
  as: "product"
})

modelSync(MaterialProduct);
module.exports = MaterialProduct;
