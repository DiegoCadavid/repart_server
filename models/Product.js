const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Budge = require("./Budge");
const configModel = require("./configModels");

const Product = db.define(
  "product",
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
        key: "id",
      },
    },
    labor_cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit_type: {
      type: DataTypes.STRING(45),
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

Product.belongsTo(Budge, {
  foreignKey: "budge_id",
  as: "budge",
});

Product.sync(configModel).then( () => {
  console.log(` > Product sincronizado con la base de datos`);
}).catch( () => {
  console.log(` > Error al sincronizar Product con la base de datos`);
})

module.exports = Product;
