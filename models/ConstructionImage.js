const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Construction = require("./Construction");

const ConstructionImage = db.define(
  "Construction_image",
  {
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
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
    tableName: "constructions_images",
    timestamps: false,
  }
);

module.exports = ConstructionImage;
