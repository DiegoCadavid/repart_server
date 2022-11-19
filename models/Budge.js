const { DataTypes } = require("sequelize");
const db = require("../database/connection");
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
    timestamps: false,
  }
);

Budge.belongsTo(Construction, {
  foreignKey: "construction_id",
  as: "construction",
});

Budge.sync().then( () => {
  console.log(` > Budge sincronizado con la base de datos`);
}).catch( () => {
  console.log(` > Error al sincronizar budge con la base de datos`);
})


module.exports = Budge;
