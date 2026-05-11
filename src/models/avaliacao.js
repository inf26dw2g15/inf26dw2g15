const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Avaliacao = sequelize.define(
  "Avaliacao",
  {
    id_avaliacao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_filme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Filmes",
        key: "id_filme",
      },
    },
    id_utilizador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Utilizadores",
        key: "id_utilizador",
      },
    },
    nota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 20,
      },
    },
    comentario: {
      type: DataTypes.TEXT,
    },
    data_avaliacao: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Avaliacoes",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["id_filme", "id_utilizador"],
        name: "uk_utilizador_filme_avaliacao",
      },
    ],
  }
);

module.exports = Avaliacao;
