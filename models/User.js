const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const { modelSync } = require("./configModels");

const User = db.define(
  "User",
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: "client",
    },
    cc: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expedition_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    security_number: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    image: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
  }
);

modelSync(User);

module.exports = User;
