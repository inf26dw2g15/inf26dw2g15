const jwt = require("jsonwebtoken");
const { Utilizador } = require("../models");
require("dotenv").config({ quiet: true });

const autenticar = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const [tipo, token] = authHeader ? authHeader.split(" ") : [];

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token Bearer nao fornecido." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ erro: "JWT_SECRET nao configurado." });
  }

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.APP_BASE_URL || "http://localhost:3000",
      audience: "cinerating-api",
      algorithms: ["HS256"],
    });

    const utilizador = await Utilizador.findByPk(claims.id_utilizador, {
      attributes: [
        "id_utilizador",
        "username",
        "email",
        "github_id",
        "nome_github",
        "avatar_url",
        "oauth_provider",
      ],
    });

    if (!utilizador) {
      return res.status(401).json({
        erro: "Utilizador associado ao token ja nao existe.",
      });
    }

    req.utilizador = utilizador.toJSON();

    console.log("=================================================");
    console.log(`[${new Date().toISOString()}] Pedido autenticado:`);
    console.log(`  ID:       ${req.utilizador.id_utilizador}`);
    console.log(`  Username: ${req.utilizador.username}`);
    console.log(`  Email:    ${req.utilizador.email}`);
    console.log(`  Provider: ${req.utilizador.oauth_provider || "github"}`);
    console.log(`  Rota:     ${req.method} ${req.originalUrl}`);
    console.log("=================================================");

    return next();
  } catch (err) {
    if (
      err.name === "TokenExpiredError" ||
      err.name === "JsonWebTokenError" ||
      err.name === "NotBeforeError"
    ) {
      return res.status(403).json({ erro: "Token invalido ou expirado." });
    }

    console.error("Erro ao validar autenticacao:", err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

module.exports = autenticar;
