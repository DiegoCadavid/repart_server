const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Budge = require("./Budge");
const {modelSync} = require("./configModels");

const BudgeMessage = db.define(
  "budge_message",
  {
    budge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Budge,
        as: "id",
      },
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "budges_messages",
    timestamps: false,
  }
);

BudgeMessage.belongsTo(Budge,{
  foreignKey: "budge_id",
  as: "budge"
})

modelSync(BudgeMessage);

module.exports = BudgeMessage;
