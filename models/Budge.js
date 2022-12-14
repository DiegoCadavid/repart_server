const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const {  modelSync } = require("./configModels");
const Construction = require("./Construction");

const Budge = db.define(
  "budge",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    construction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Construction,
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

Budge.belongsTo(Construction, {
  foreignKey: "construction_id",
  as: "construction",
});

modelSync(Budge);

module.exports = Budge;
