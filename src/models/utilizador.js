const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Utilizador = sequelize.define(
  "Utilizador",
  {
    id_utilizador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "OAUTH_GITHUB",
    },
    github_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    nome_github: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    oauth_provider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "local",
    },
    data_registo: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Utilizadores",
    timestamps: false,
  }
);

module.exports = Utilizador;
