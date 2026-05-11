const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const autenticar = require("../middleware/auth");

const router = express.Router();

function criarJwt(utilizador) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nao configurado.");
  }

  return jwt.sign(
    {
      id_utilizador: utilizador.id_utilizador,
      username: utilizador.username,
      email: utilizador.email,
      github_id: utilizador.github_id,
      oauth_provider: utilizador.oauth_provider,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: process.env.APP_BASE_URL || "http://localhost:3000",
      audience: "cinerating-api",
      subject: String(utilizador.id_utilizador),
    }
  );
}

function oauthGithubConfigurado() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

function exigirOauthGithub(req, res, next) {
  if (!oauthGithubConfigurado()) {
    return res.status(500).json({
      erro: "OAuth GitHub nao configurado. Defina GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET.",
    });
  }

  return next();
}

router.get("/github", exigirOauthGithub, (req, res, next) => {
  const isApiClient =
    req.headers["accept"]?.includes("application/json") ||
    req.headers["x-requested-with"] === "XMLHttpRequest";

  if (isApiClient) {
    res.redirect = (url) => {
      return res.json({ authUrl: url });
    };
  }

  return passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    state: true,
    session: false,
  })(req, res, next);
});

router.get(
  "/github/callback",
  exigirOauthGithub,
  passport.authenticate("github", {
    failureRedirect: "/auth/falha",
    state: true,
    session: false,
  }),
  (req, res) => {
    try {
      const token = criarJwt(req.user);

      return res.json({
        mensagem: "Autenticacao com GitHub efetuada com sucesso.",
        token,
        utilizador: {
          id_utilizador: req.user.id_utilizador,
          username: req.user.username,
          email: req.user.email,
          github_id: req.user.github_id,
          nome_github: req.user.nome_github,
          avatar_url: req.user.avatar_url,
          oauth_provider: req.user.oauth_provider,
        },
        instrucao:
          "Copie o token e use-o no header Authorization: Bearer <token>.",
      });
    } catch (error) {
      console.error("Erro ao criar JWT:", error);
      return res.status(500).json({ erro: "Nao foi possivel criar o JWT." });
    }
  }
);

router.get("/falha", (req, res) => {
  res.status(401).json({ erro: "Falha na autenticacao com GitHub." });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {});
  }

  return res.json({
    mensagem:
      "A API usa JWT stateless. Para terminar sessao, elimine o token no cliente.",
  });
});

router.get("/me", autenticar, (req, res) => {
  return res.json({ utilizador: req.utilizador });
});

module.exports = router;
