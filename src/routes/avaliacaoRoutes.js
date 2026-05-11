const express = require("express");
const router = express.Router();
const { Avaliacao, Filme, Utilizador } = require("../models");
const {
  respostaErroConflito,
  respostaErroValidacao,
  tratarErroSequelize,
  validarInteiroPositivo,
  validarNota,
} = require("../utils/erros");

function normalizarAvaliacao(body, parcial = false) {
  const dados = {};

  if (!parcial || body.id_filme !== undefined) {
    if (!validarInteiroPositivo(body.id_filme)) {
      return { erro: "id_filme e obrigatorio e tem de ser inteiro positivo." };
    }
    dados.id_filme = Number(body.id_filme);
  }

  if (!parcial || body.nota !== undefined) {
    if (!validarNota(body.nota)) {
      return { erro: "nota tem de ser um inteiro entre 0 e 20." };
    }
    dados.nota = Number(body.nota);
  }

  if (body.comentario !== undefined) {
    if (body.comentario !== null && typeof body.comentario !== "string") {
      return { erro: "comentario tem de ser texto ou null." };
    }
    dados.comentario = body.comentario;
  }

  return { dados };
}

function normalizarAtualizacaoAvaliacao(body, parcial = false) {
  const dados = {};

  if (body.id_filme !== undefined || body.id_utilizador !== undefined) {
    return {
      erro: "id_filme e id_utilizador nao podem ser alterados neste endpoint.",
    };
  }

  if (!parcial) {
    const camposEmFalta = ["nota", "comentario"].filter(
      (campo) => body[campo] === undefined
    );

    if (camposEmFalta.length > 0) {
      return {
        erro: `PUT exige uma representacao completa da avaliacao. Campos em falta: ${camposEmFalta.join(
          ", "
        )}.`,
      };
    }
  }

  if (!parcial || body.nota !== undefined) {
    if (!validarNota(body.nota)) {
      return { erro: "nota tem de ser um inteiro entre 0 e 20." };
    }
    dados.nota = Number(body.nota);
  }

  if (!parcial || body.comentario !== undefined) {
    if (body.comentario !== null && typeof body.comentario !== "string") {
      return { erro: "comentario tem de ser texto ou null." };
    }
    dados.comentario = body.comentario;
  }

  return { dados };
}

router.get("/", async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { id_utilizador: req.utilizador.id_utilizador },
      include: [{ model: Filme, as: "filme" }],
      order: [["id_avaliacao", "ASC"]],
    });

    return res.json(avaliacoes);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao listar avaliacoes:");
  }
});

router.get("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de avaliacao invalido.");
  }

  try {
    const avaliacao = await Avaliacao.findOne({
      where: {
        id_avaliacao: req.params.id,
        id_utilizador: req.utilizador.id_utilizador,
      },
      include: [
        { model: Filme, as: "filme" },
        {
          model: Utilizador,
          as: "utilizador",
          attributes: ["id_utilizador", "username", "email"],
        },
      ],
    });

    if (!avaliacao) {
      return res
        .status(404)
        .json({ erro: "Avaliacao nao encontrada ou sem permissao de acesso." });
    }

    return res.json(avaliacao);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao obter avaliacao:");
  }
});

router.post("/", async (req, res) => {
  try {
    const { dados, erro } = normalizarAvaliacao(req.body);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    const filme = await Filme.findByPk(dados.id_filme);
    if (!filme) {
      return res.status(404).json({ erro: "Filme nao encontrado." });
    }

    const existente = await Avaliacao.findOne({
      where: {
        id_filme: dados.id_filme,
        id_utilizador: req.utilizador.id_utilizador,
      },
    });

    if (existente) {
      return respostaErroConflito(
        res,
        "Este filme ja foi avaliado por este utilizador."
      );
    }

    const avaliacao = await Avaliacao.create({
      ...dados,
      id_utilizador: req.utilizador.id_utilizador,
    });

    return res
      .status(201)
      .json({ mensagem: "Avaliacao criada com sucesso.", avaliacao });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao criar avaliacao:");
  }
});

async function atualizarAvaliacao(req, res, parcial = false) {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de avaliacao invalido.");
  }

  try {
    const avaliacao = await Avaliacao.findOne({
      where: {
        id_avaliacao: req.params.id,
        id_utilizador: req.utilizador.id_utilizador,
      },
    });

    if (!avaliacao) {
      return res
        .status(404)
        .json({ erro: "Avaliacao nao encontrada ou sem permissao de acesso." });
    }

    const { dados, erro } = normalizarAtualizacaoAvaliacao(req.body, parcial);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    if (Object.keys(dados).length === 0) {
      return respostaErroValidacao(
        res,
        "Indique nota e/ou comentario para atualizar."
      );
    }

    await avaliacao.update(dados);
    return res.json({ mensagem: "Avaliacao atualizada com sucesso.", avaliacao });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao atualizar avaliacao:");
  }
}

router.put("/:id", (req, res) => atualizarAvaliacao(req, res, false));
router.patch("/:id", (req, res) => atualizarAvaliacao(req, res, true));

router.delete("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de avaliacao invalido.");
  }

  try {
    const avaliacao = await Avaliacao.findOne({
      where: {
        id_avaliacao: req.params.id,
        id_utilizador: req.utilizador.id_utilizador,
      },
    });

    if (!avaliacao) {
      return res
        .status(404)
        .json({ erro: "Avaliacao nao encontrada ou sem permissao de acesso." });
    }

    await avaliacao.destroy();
    return res.json({ mensagem: "Avaliacao apagada com sucesso." });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao apagar avaliacao:");
  }
});

module.exports = router;
