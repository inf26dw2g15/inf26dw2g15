const express = require("express");
const router = express.Router();
const { Watchlist, Filme } = require("../models");
const {
  respostaErroConflito,
  respostaErroValidacao,
  tratarErroSequelize,
  validarInteiroPositivo,
} = require("../utils/erros");

function validarBoolean(valor) {
  return typeof valor === "boolean";
}

router.get("/", async (req, res) => {
  try {
    const watchlist = await Watchlist.findAll({
      where: { id_utilizador: req.utilizador.id_utilizador },
      include: [{ model: Filme, as: "filme" }],
      order: [["data_adicionado", "DESC"]],
    });

    return res.json(watchlist);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao listar watchlist:");
  }
});

router.get("/:id_filme", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id_filme)) {
    return respostaErroValidacao(res, "id_filme invalido.");
  }

  try {
    const item = await Watchlist.findOne({
      where: {
        id_utilizador: req.utilizador.id_utilizador,
        id_filme: req.params.id_filme,
      },
      include: [{ model: Filme, as: "filme" }],
    });

    if (!item) {
      return res
        .status(404)
        .json({ erro: "Filme nao encontrado na watchlist deste utilizador." });
    }

    return res.json(item);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao obter item da watchlist:");
  }
});

router.post("/", async (req, res) => {
  try {
    const { id_filme } = req.body;

    if (!validarInteiroPositivo(id_filme)) {
      return respostaErroValidacao(
        res,
        "id_filme e obrigatorio e tem de ser inteiro positivo."
      );
    }

    const filme = await Filme.findByPk(id_filme);
    if (!filme) {
      return res.status(404).json({ erro: "Filme nao encontrado." });
    }

    const [item, criado] = await Watchlist.findOrCreate({
      where: {
        id_utilizador: req.utilizador.id_utilizador,
        id_filme: Number(id_filme),
      },
      defaults: {
        visto: false,
      },
    });

    if (!criado) {
      return respostaErroConflito(res, "Este filme ja esta na watchlist.");
    }

    return res
      .status(201)
      .json({ mensagem: "Filme adicionado a watchlist.", item });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao adicionar a watchlist:");
  }
});

async function atualizarWatchlist(req, res) {
  if (!validarInteiroPositivo(req.params.id_filme)) {
    return respostaErroValidacao(res, "id_filme invalido.");
  }

  try {
    const { visto } = req.body;

    if (!validarBoolean(visto)) {
      return respostaErroValidacao(res, "visto e obrigatorio e tem de ser boolean.");
    }

    const item = await Watchlist.findOne({
      where: {
        id_utilizador: req.utilizador.id_utilizador,
        id_filme: req.params.id_filme,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ erro: "Filme nao encontrado na watchlist deste utilizador." });
    }

    await item.update({ visto });
    return res.json({ mensagem: "Watchlist atualizada com sucesso.", item });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao atualizar watchlist:");
  }
}

router.put("/:id_filme", atualizarWatchlist);
router.patch("/:id_filme", atualizarWatchlist);

router.delete("/:id_filme", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id_filme)) {
    return respostaErroValidacao(res, "id_filme invalido.");
  }

  try {
    const item = await Watchlist.findOne({
      where: {
        id_utilizador: req.utilizador.id_utilizador,
        id_filme: req.params.id_filme,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ erro: "Filme nao encontrado na watchlist deste utilizador." });
    }

    await item.destroy();
    return res.json({ mensagem: "Filme removido da watchlist." });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao remover da watchlist:");
  }
});

module.exports = router;
