function respostaErroValidacao(res, mensagem, detalhes = undefined) {
  return res.status(400).json({
    erro: mensagem,
    ...(detalhes ? { detalhes } : {}),
  });
}

function respostaErroConflito(res, mensagem, detalhes = undefined) {
  return res.status(409).json({
    erro: mensagem,
    ...(detalhes ? { detalhes } : {}),
  });
}

function tratarErroSequelize(error, res, mensagemPadrao) {
  if (error.name === "SequelizeUniqueConstraintError") {
    const detalhes = error.errors?.map((erro) => ({
      campo: erro.path,
      mensagem: erro.message,
    }));

    return respostaErroConflito(
      res,
      "Ja existe um registo com esses dados.",
      detalhes
    );
  }

  if (error.name === "SequelizeValidationError") {
    const detalhes = error.errors?.map((erro) => ({
      campo: erro.path,
      mensagem: erro.message,
    }));

    return respostaErroValidacao(res, "Dados invalidos.", detalhes);
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return respostaErroValidacao(
      res,
      "O pedido referencia um recurso relacionado que nao existe."
    );
  }

  console.error(mensagemPadrao, error);
  return res.status(500).json({ erro: "Erro interno do servidor." });
}

function validarInteiroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

function validarNota(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 && numero <= 20;
}

module.exports = {
  respostaErroConflito,
  respostaErroValidacao,
  tratarErroSequelize,
  validarInteiroPositivo,
  validarNota,
};
