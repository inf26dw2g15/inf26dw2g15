const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Genero = sequelize.define(
  "Genero",
  {
    id_genero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_genero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "Generos",
    timestamps: false,
  }
);

module.exports = Genero;