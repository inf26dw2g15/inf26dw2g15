const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Filme = sequelize.define(
  "Filme",
  {
    id_filme: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ano_lancamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duracao_minutos: {
      type: DataTypes.INTEGER,
    },
    sinopse: {
      type: DataTypes.TEXT,
    },
    id_genero: {
      type: DataTypes.INTEGER,
      references: {
        model: "Generos",
        key: "id_genero",
      },
    },
  },
  {
    tableName: "Filmes",
    timestamps: false,
  }
);

module.exports = Filme;