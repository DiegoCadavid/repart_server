const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const Budge = require("./Budge");

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

BudgeMessage.sync().then( () => {
  console.log(` > BudgeMessage sincronizado con la base de datos`);
}).catch( () => {
  console.log(` > Error al sincronizar BudgeMessage con la base de datos`);
})


module.exports = BudgeMessage;
