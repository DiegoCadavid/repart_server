const { DataTypes } = require("sequelize");
const db = require("../database/connection");
const {modelSync} = require("./configModels");
const User = require("./User");

const Material = db.define(
  "material",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit_type: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    create_by: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
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

Material.belongsTo(User, {
  foreignKey: "create_by",
  as: "creator",
});

modelSync(Material);

module.exports = Material;
