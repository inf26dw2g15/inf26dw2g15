const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Watchlist = sequelize.define(
  "Watchlist",
  {
    id_utilizador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Utilizadores",
        key: "id_utilizador",
      },
    },
    id_filme: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Filmes",
        key: "id_filme",
      },
    },
    data_adicionado: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    visto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Watchlist",
    timestamps: false,
  }
);

module.exports = Watchlist;
