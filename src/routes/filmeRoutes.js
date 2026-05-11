const express = require("express");
const router = express.Router();
const { Filme, Genero, Avaliacao } = require("../models");
const {
  respostaErroValidacao,
  tratarErroSequelize,
  validarInteiroPositivo,
} = require("../utils/erros");

function normalizarFilme(body, parcial = false) {
  const dados = {};
  const camposCompletos = [
    "titulo",
    "ano_lancamento",
    "duracao_minutos",
    "sinopse",
    "id_genero",
  ];

  if (!parcial) {
    const camposEmFalta = camposCompletos.filter(
      (campo) => body[campo] === undefined
    );

    if (camposEmFalta.length > 0) {
      return {
        erro: `PUT exige uma representacao completa do filme. Campos em falta: ${camposEmFalta.join(
          ", "
        )}.`,
      };
    }
  }

  if (!parcial || body.titulo !== undefined) {
    if (typeof body.titulo !== "string" || body.titulo.trim().length === 0) {
      return { erro: "titulo e obrigatorio e tem de ser texto nao vazio." };
    }
    dados.titulo = body.titulo.trim();
  }

  if (!parcial || body.ano_lancamento !== undefined) {
    const ano = Number(body.ano_lancamento);
    if (!Number.isInteger(ano) || ano < 1888) {
      return { erro: "ano_lancamento tem de ser um inteiro valido." };
    }
    dados.ano_lancamento = ano;
  }

  if (body.duracao_minutos !== undefined && body.duracao_minutos !== null) {
    const duracao = Number(body.duracao_minutos);
    if (!Number.isInteger(duracao) || duracao <= 0) {
      return { erro: "duracao_minutos tem de ser um inteiro positivo." };
    }
    dados.duracao_minutos = duracao;
  } else if (body.duracao_minutos === null) {
    dados.duracao_minutos = null;
  }

  if (body.sinopse !== undefined) {
    if (body.sinopse !== null && typeof body.sinopse !== "string") {
      return { erro: "sinopse tem de ser texto ou null." };
    }
    dados.sinopse = body.sinopse;
  }

  if (body.id_genero !== undefined && body.id_genero !== null) {
    if (!validarInteiroPositivo(body.id_genero)) {
      return { erro: "id_genero tem de ser um inteiro positivo." };
    }
    dados.id_genero = Number(body.id_genero);
  } else if (body.id_genero === null) {
    dados.id_genero = null;
  }

  return { dados };
}

async function validarGenero(idGenero) {
  if (idGenero === undefined || idGenero === null) {
    return true;
  }

  const genero = await Genero.findByPk(idGenero);
  return Boolean(genero);
}

async function atualizarFilme(req, res, parcial = false) {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de filme invalido.");
  }

  try {
    const filme = await Filme.findByPk(req.params.id);

    if (!filme) {
      return res.status(404).json({ erro: "Filme nao encontrado." });
    }

    const { dados, erro } = normalizarFilme(req.body, parcial);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    if (Object.keys(dados).length === 0) {
      return respostaErroValidacao(
        res,
        "Indique pelo menos um campo para atualizar."
      );
    }

    if (!(await validarGenero(dados.id_genero))) {
      return respostaErroValidacao(res, "O genero indicado nao existe.");
    }

    await filme.update(dados);

    return res.json({ mensagem: "Filme atualizado com sucesso.", filme });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao atualizar filme:");
  }
}

router.get("/", async (req, res) => {
  try {
    const filmes = await Filme.findAll({
      include: [
        {
          model: Genero,
          as: "genero",
          attributes: ["id_genero", "nome_genero"],
        },
      ],
      order: [["id_filme", "ASC"]],
    });

    return res.json(filmes);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao listar filmes:");
  }
});

router.get("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de filme invalido.");
  }

  try {
    const filme = await Filme.findByPk(req.params.id, {
      include: [
        {
          model: Genero,
          as: "genero",
          attributes: ["id_genero", "nome_genero"],
        },
        { model: Avaliacao, as: "avaliacoes" },
      ],
    });

    if (!filme) {
      return res.status(404).json({ erro: "Filme nao encontrado." });
    }

    return res.json(filme);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao obter filme:");
  }
});

router.post("/", async (req, res) => {
  try {
    const { dados, erro } = normalizarFilme(req.body);
    if (erro) {
      return respostaErroValidacao(res, erro);
    }

    if (!(await validarGenero(dados.id_genero))) {
      return respostaErroValidacao(res, "O genero indicado nao existe.");
    }

    const filme = await Filme.create(dados);

    return res.status(201).json({ mensagem: "Filme criado com sucesso.", filme });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao criar filme:");
  }
});

router.put("/:id", (req, res) => atualizarFilme(req, res, false));
router.patch("/:id", (req, res) => atualizarFilme(req, res, true));

router.delete("/:id", async (req, res) => {
  if (!validarInteiroPositivo(req.params.id)) {
    return respostaErroValidacao(res, "id de filme invalido.");
  }

  try {
    const filme = await Filme.findByPk(req.params.id);

    if (!filme) {
      return res.status(404).json({ erro: "Filme nao encontrado." });
    }

    await filme.destroy();

    return res.json({ mensagem: "Filme apagado com sucesso." });
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro ao apagar filme:");
  }
});

module.exports = router;
