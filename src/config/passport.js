const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { Utilizador } = require("../models");

async function criarUsernameUnico(usernameBase, githubId) {
  const base = (usernameBase || `github_${githubId}`)
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const existente = await Utilizador.findOne({ where: { username: base } });

  if (!existente) {
    return base;
  }

  return `${base}_${githubId}`.slice(0, 50);
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          process.env.GITHUB_CALLBACK_URL ||
          "http://localhost:3000/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = String(profile.id);
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : `${profile.username || githubId}@github.local`;

          let utilizador = await Utilizador.findOne({
            where: { github_id: githubId },
          });

          const username = utilizador
            ? utilizador.username
            : await criarUsernameUnico(profile.username, githubId);

          const dadosUtilizador = {
            username,
            email,
            password_hash: "OAUTH_GITHUB",
            github_id: githubId,
            nome_github: profile.displayName || profile.username || username,
            avatar_url: profile.photos?.[0]?.value || null,
            oauth_provider: "github",
          };

          if (!utilizador) {
            utilizador = await Utilizador.findOne({ where: { email } });
          }

          if (utilizador) {
            await utilizador.update(dadosUtilizador);
          } else {
            utilizador = await Utilizador.create(dadosUtilizador);
          }

          return done(null, utilizador);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    "OAuth GitHub nao configurado. Defina GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET para activar /auth/github."
  );
}
