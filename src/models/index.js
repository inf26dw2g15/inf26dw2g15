const sequelize = require("../config/db");
const Utilizador = require("./utilizador");
const Genero = require("./genero");
const Filme = require("./filme");
const Avaliacao = require("./avaliacao");
const Watchlist = require("./watchlist");

// Genero tem muitos Filmes (1:N)
Genero.hasMany(Filme, { foreignKey: "id_genero", as: "filmes" });
Filme.belongsTo(Genero, { foreignKey: "id_genero", as: "genero" });

// Utilizador tem muitas Avaliacoes (1:N)
Utilizador.hasMany(Avaliacao, { foreignKey: "id_utilizador", as: "avaliacoes" });
Avaliacao.belongsTo(Utilizador, { foreignKey: "id_utilizador", as: "utilizador" });

// Filme tem muitas Avaliacoes (1:N)
Filme.hasMany(Avaliacao, { foreignKey: "id_filme", as: "avaliacoes" });
Avaliacao.belongsTo(Filme, { foreignKey: "id_filme", as: "filme" });

// Utilizador tem muitos itens na Watchlist (1:N)
Utilizador.hasMany(Watchlist, { foreignKey: "id_utilizador", as: "watchlist" });
Watchlist.belongsTo(Utilizador, { foreignKey: "id_utilizador", as: "utilizador" });

// Filme tem muitos itens na Watchlist (1:N)
Filme.hasMany(Watchlist, { foreignKey: "id_filme", as: "watchlist" });
Watchlist.belongsTo(Filme, { foreignKey: "id_filme", as: "filme" });

module.exports = { sequelize, Utilizador, Genero, Filme, Avaliacao, Watchlist };