const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const session = require("express-session");
const passport = require("passport");
const YAML = require("yamljs");
const path = require("path");
require("dotenv").config({ quiet: true });

require("./config/passport");

const { sequelize } = require("./models");
const autenticar = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const filmeRoutes = require("./routes/filmeRoutes");
const generoRoutes = require("./routes/generoRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET nao configurado.");
}

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ mensagem: "API CineRating a funcionar." });
});

try {
  const swaggerDocument = YAML.load(
    path.resolve(__dirname, "..", "docs", "cinerating_openapi.yaml")
  );
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn(
    "Não foi possível carregar a documentação OpenAPI:",
    error.message
  );
}

app.use("/auth", authRoutes);

app.use("/filmes", autenticar, filmeRoutes);
app.use("/generos", autenticar, generoRoutes);
app.use("/avaliacoes", autenticar, avaliacaoRoutes);
app.use("/watchlist", autenticar, watchlistRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Ligação ao MySQL estabelecida.");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Modelos sincronizados.");
    app.listen(PORT, () => {
      console.log(`Servidor a correr na porta ${PORT}`);
      console.log(
        `Documentação disponível em http://localhost:${PORT}/api-docs`
      );
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar servidor:", err);
  });
