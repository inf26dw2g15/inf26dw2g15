const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const diretorios = ["src"];

function listarJs(diretorio) {
  const absoluto = path.join(raiz, diretorio);
  const entradas = fs.readdirSync(absoluto, { withFileTypes: true });

  return entradas.flatMap((entrada) => {
    const relativo = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      return listarJs(relativo);
    }
    return entrada.isFile() && entrada.name.endsWith(".js") ? [relativo] : [];
  });
}

const ficheiros = diretorios.flatMap(listarJs);
let falhou = false;

for (const ficheiro of ficheiros) {
  const resultado = spawnSync(process.execPath, ["--check", ficheiro], {
    cwd: raiz,
    stdio: "inherit",
  });

  if (resultado.status !== 0) {
    falhou = true;
  }
}

if (falhou) {
  process.exit(1);
}

console.log(`Sintaxe validada em ${ficheiros.length} ficheiros JS.`);
