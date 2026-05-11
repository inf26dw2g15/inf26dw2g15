const express = require("express");
const router = express.Router();
const { Genero, Filme } = require("../models");
const {
  respostaErroConflito,
  respostaErroValidacao,
  tratarErroSequelize,
  validarInteiroPositivo,
} = require("../utils/erros");

function normalizarGenero(body) {
  if (
    typeof body.nome_genero !== "string" ||
    body.nome_genero.trim().length === 0
  ) {
    return { erro: "nome_genero e obrigatorio e tem de ser texto nao vazio." };
  }

  return { dados: { nome_genero: body.nome_genero.trim() } };
}

router.get("/", async (req, res) => {
  try {
    const generos = await Genero.findAll({ order: [["id_genero", "ASC"]] });
    return res.json(generos);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao listar generos:");
  }
});

router.get("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de genero invalido.");
  }

  try {
    const genero = await Genero.findByPk(req.params.id, {
      include: [{ model: Filme, as: "filmes" }],
    });

    if (!genero) {
      return res.status(404).json({ erro: "Genero nao encontrado." });
    }

    return res.json(genero);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao obter genero:");
  }
});

router.post("/", async (req, res) => {
  try {
    const { dados, erro } = normalizarGenero(req.body);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    const genero = await Genero.create(dados);
    return res.status(201).json({ mensagem: "Genero criado com sucesso.", genero });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao criar genero:");
  }
});

async function atualizarGenero(req, res) {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de genero invalido.");
  }

  try {
    const genero = await Genero.findByPk(req.params.id);

    if (!genero) {
      return res.status(404).json({ erro: "Genero nao encontrado." });
    }

    const { dados, erro } = normalizarGenero(req.body);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    await genero.update(dados);
    return res.json({ mensagem: "Genero atualizado com sucesso.", genero });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao atualizar genero:");
  }
}

router.put("/:id", atualizarGenero);
router.patch("/:id", atualizarGenero);

router.delete("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de genero invalido.");
  }

  try {
    const genero = await Genero.findByPk(req.params.id);

    if (!genero) {
      return res.status(404).json({ erro: "Genero nao encontrado." });
    }

    const filmesAssociados = await Filme.count({
      where: { id_genero: genero.id_genero },
    });

    if (filmesAssociados > 0) {
      return respostaErroConflito(
        res,
        "Nao e possivel apagar um genero com filmes associados."
      );
    }

    await genero.destroy();
    return res.json({ mensagem: "Genero apagado com sucesso." });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao apagar genero:");
  }
});

module.exports = router;
