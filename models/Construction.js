const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const User = require("./User");

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

module.exports = Construction;
