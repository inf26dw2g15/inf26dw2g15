# CineRating - API REST para avaliacao de filmes

API REST desenvolvida em Node.js/Express para gestao de filmes, generos, avaliacoes e watchlist. O projecto usa MySQL como SGBD, Sequelize como ORM, Docker Compose para executar a API e a base de dados, OpenAPI 3.0 para documentacao e uma Collection Postman para consulta/teste dos endpoints.

## Tecnologias

- Node.js
- Express
- MySQL 8
- Sequelize
- Docker / Docker Compose
- OAuth 2.0 com GitHub
- JWT Bearer Token
- OpenAPI 3.0 / Swagger UI
- Postman

## Recursos REST implementados

| Recurso | Endpoint base | Operacoes |
|---|---|---|
| Filmes | `/filmes` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| Generos | `/generos` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| Avaliacoes | `/avaliacoes` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| Watchlist | `/watchlist` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

Todas as representacoes sao devolvidas em JSON. As rotas de recursos estao protegidas por JWT no header:

```txt
Authorization: Bearer <token>
```

## Relacoes entre recursos

O modelo de dados inclui varias relacoes de cardinalidade 1:N:

- `Genero 1:N Filme`
- `Utilizador 1:N Avaliacao`
- `Filme 1:N Avaliacao`
- `Utilizador 1:N Watchlist`
- `Filme 1:N Watchlist`

As avaliacoes e a watchlist sao recursos dependentes do utilizador autenticado. O cliente nao envia nem escolhe o `id_utilizador`; a API usa sempre o identificador presente no JWT validado.

## Autenticacao com GitHub OAuth 2.0

O projecto implementa o flow **Authorization Code Grant** com GitHub:

1. O utilizador acede a `GET /auth/github`.
2. A API redirecciona para o GitHub com os scopes `read:user` e `user:email`.
3. O GitHub autentica o utilizador e pede autorizacao.
4. O GitHub redirecciona para `GET /auth/github/callback` com `code` e `state`.
5. O Passport/GitHub troca o `code` por um access token junto do GitHub.
6. A API usa os dados devolvidos pelo GitHub para criar ou actualizar o utilizador em `Utilizadores`.
7. A API emite um JWT proprio com `id_utilizador`, `username`, `email`, `github_id`, `issuer`, `audience`, `subject` e expiracao.
8. O JWT passa a ser usado nas rotas protegidas da API.

O parametro `state` e suportado por `express-session` para mitigar ataques CSRF no processo de login OAuth. A sessao nao e usada como mecanismo principal de autenticacao da API; as rotas REST usam JWT stateless.

## Autorizacao

A autorizacao e aplicada em dois niveis:

- Todas as rotas de recursos (`/filmes`, `/generos`, `/avaliacoes`, `/watchlist`) exigem JWT valido.
- Nos recursos privados, a API filtra sempre pelo `id_utilizador` do token:
  - `GET /avaliacoes` lista apenas avaliacoes do proprio utilizador.
  - `GET /avaliacoes/:id`, `PUT/PATCH /avaliacoes/:id` e `DELETE /avaliacoes/:id` procuram simultaneamente `id_avaliacao` e `id_utilizador`.
  - `GET /watchlist`, `GET /watchlist/:id_filme`, `PUT/PATCH /watchlist/:id_filme` e `DELETE /watchlist/:id_filme` usam sempre `id_utilizador` do JWT.

Assim, mesmo que um utilizador tente alterar ids no URL ou no body, nao consegue aceder a avaliacoes/watchlist de outro utilizador.

Filmes e generos sao tratados como recursos globais do catalogo. Qualquer utilizador autenticado pode cria-los/alterá-los nesta versao. Numa versao com perfis, estes endpoints deveriam ser limitados a administradores.

## Comparacao com outros flows OAuth 2.0

- **Authorization Code Grant**: flow usado neste projecto. E adequado para uma aplicacao servidor-side, porque o servidor recebe o `code`, comunica com o GitHub e emite um token interno para a API.
- **Authorization Code com PKCE**: recomendado para clientes publicos como SPA ou mobile, porque protege melhor a troca do `code` quando o cliente nao consegue guardar segredo. Neste projecto o cliente confidencial e o servidor Node.js, por isso o segredo GitHub fica no backend.
- **Implicit Grant**: flow antigo e hoje desaconselhado. Entregava tokens directamente ao browser, aumentando o risco de exposicao.
- **Client Credentials**: adequado para autenticacao maquina-a-maquina, sem utilizador final. Nao serve para login de utilizadores GitHub.
- **Resource Owner Password Credentials**: obsoleto e inseguro, porque exigiria recolher credenciais do utilizador. Nao deve ser usado quando existe um Authorization Server como o GitHub.

## Logs de pedidos protegidos

Sempre que chega um pedido protegido com JWT valido, o middleware imprime na consola:

```txt
ID do utilizador
Username
Email
Provider OAuth
Metodo HTTP
Rota acedida
```

Isto cumpre o requisito de apresentar os detalhes do utilizador autenticado sempre que e recebido um pedido protegido.

## Como configurar o OAuth no GitHub

No GitHub, criar uma OAuth App em:

```txt
Settings > Developer settings > OAuth Apps > New OAuth App
```

Valores recomendados:

```txt
Application name: CineRating
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/auth/github/callback
```

Depois copiar `Client ID` e `Client Secret` para um ficheiro `.env` criado a partir de `.env.example`.

Importante: o ficheiro `.env` contem segredos e nao deve ser entregue nem versionado. A entrega deve incluir apenas `.env.example`.

## Variaveis de ambiente

Exemplo em `.env.example`:

```env
PORT=3000
APP_BASE_URL=http://localhost:3000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=cinerating_db
DB_USER=root
DB_PASSWORD=alterar_password_mysql
JWT_SECRET=alterar_para_um_segredo_jwt_longo
JWT_EXPIRES_IN=1h
SESSION_SECRET=alterar_para_um_segredo_de_sessao_longo
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

Quando a API corre dentro do Docker, `DB_HOST=mysql` esta correcto porque `mysql` e o nome do servico no `docker-compose.yml`.

O `docker-compose.yml` nao define valores por defeito para `DB_PASSWORD`, `JWT_SECRET` e `SESSION_SECRET`. Antes de executar os containers, criar um ficheiro `.env` a partir de `.env.example` e trocar estes valores por segredos proprios.

## Executar com Docker

Na raiz do projecto:

```bash
docker compose up --build
```

Se for necessario recriar a base de dados e voltar a executar a seed:

```bash
docker compose down -v
docker compose up --build
```

Os scripts em `db/init/` so sao executados automaticamente quando o volume MySQL e criado pela primeira vez.

## Enderecos importantes

```txt
API: http://localhost:3000
Swagger/OpenAPI: http://localhost:3000/api-docs
Login GitHub: http://localhost:3000/auth/github
Callback GitHub: http://localhost:3000/auth/github/callback
```

## Testar o login

1. Abrir no browser:

```txt
http://localhost:3000/auth/github
```

2. Autorizar a aplicacao no GitHub.
3. Copiar o `token` devolvido no callback.
4. Colocar esse token na variavel `token` da Collection Postman.
5. Executar os pedidos protegidos.

Tambem e possivel chamar `GET /auth/github` no Postman com header `Accept: application/json`; nesse caso a API devolve um JSON com `authUrl`.

## Como testar no Postman passo a passo

1. Importar a collection `postman/CineRating.postman_collection.json` no Postman.
2. Criar uma `Environment` e adicionar a variavel `token`.
3. Autenticar com GitHub via `GET /auth/github` no browser ou usando `GET /auth/github` no Postman com `Accept: application/json`.
4. Copiar o JWT retornado e colar em `{{token}}` no Environment do Postman.
5. Nos pedidos protegidos, validar que o header `Authorization` usa:

```txt
Authorization: Bearer {{token}}
```

6. Executar os endpoints de `Avaliacoes` e `Watchlist`.

> Nota: `avaliacoes` e `watchlist` sao recursos privados do utilizador autenticado. A API filtra sempre pelo `id_utilizador` do JWT, por isso cada utilizador so ve e altera as suas proprias avaliacoes e itens da watchlist.

## Rotas principais

### Autenticacao

```txt
GET /auth/github
GET /auth/github/callback
GET /auth/falha
GET /auth/me
GET /auth/logout
```

### Filmes

```txt
GET /filmes
GET /filmes/:id
POST /filmes
PUT /filmes/:id
PATCH /filmes/:id
DELETE /filmes/:id
```

### Generos

```txt
GET /generos
GET /generos/:id
POST /generos
PUT /generos/:id
PATCH /generos/:id
DELETE /generos/:id
```

### Avaliacoes

```txt
GET /avaliacoes
GET /avaliacoes/:id
POST /avaliacoes
PUT /avaliacoes/:id
PATCH /avaliacoes/:id
DELETE /avaliacoes/:id
```

### Watchlist

```txt
GET /watchlist
GET /watchlist/:id_filme
POST /watchlist
PUT /watchlist/:id_filme
PATCH /watchlist/:id_filme
DELETE /watchlist/:id_filme
```

### Semantica de PUT e PATCH

Nos recursos com varios campos editaveis, `PUT` e `PATCH` foram separados:

- `PUT /filmes/:id` exige a representacao completa dos campos editaveis (`titulo`, `ano_lancamento`, `duracao_minutos`, `sinopse`, `id_genero`).
- `PATCH /filmes/:id` permite alterar apenas os campos enviados.
- `PUT /avaliacoes/:id` exige `nota` e `comentario`.
- `PATCH /avaliacoes/:id` permite alterar apenas `nota` ou `comentario`.

Em `generos` e `watchlist`, a diferenca pratica e menor porque estes recursos so tem um campo principal editavel nesta API.

## Base de dados e seed

O ficheiro principal esta em:

```txt
db/init/01_schema_seed.sql
```

Este ficheiro cria a estrutura relacional e insere dados iniciais. As tabelas directamente suportadas pela API sao:

```txt
Generos
Filmes
Utilizadores
Avaliacoes
Watchlist
```

A seed tambem inclui tabelas auxiliares (`Pessoas`, `Premios`, `Plataformas`, `Elenco_Filme`, `Filme_Premios`, `Filme_Plataforma`) para enriquecer o dominio da base de dados. Estas tabelas nao estao expostas como endpoints REST nesta versao.

## Postman

A Collection esta em:

```txt
postman/CineRating.postman_collection.json
```

A Collection:

- usa a variavel `baseUrl`;
- usa a variavel `token` para o JWT;
- cria genero, filme, avaliacao e watchlist de teste;
- guarda automaticamente os ids criados;
- testa `GET`, `POST`, `PUT`, `PATCH` e `DELETE`;
- evita depender de ids fixos da seed.

## OpenAPI

A documentacao OpenAPI 3.0 esta em:

```txt
docs/cinerating_openapi.yaml
```

Tambem pode ser consultada em runtime:

```txt
http://localhost:3000/api-docs
```

## Validacao rapida de sintaxe

Foi incluido um script para validar a sintaxe dos ficheiros JavaScript:

```bash
npm run check
```

## Limitacoes assumidas

- Filmes e generos sao globais e podem ser alterados por qualquer utilizador autenticado.
- Nao existe sistema de roles (`admin`, `user`) nesta versao.
- O logout JWT e stateless: o cliente elimina o token e o servidor deixa o token expirar. Nao existe blacklist/revogacao de tokens.
- A seed SQL contem tabelas auxiliares que nao sao expostas como endpoints REST.

## Ficheiros principais para entrega

```txt
src/
db/init/01_schema_seed.sql
docs/cinerating_openapi.yaml
postman/CineRating.postman_collection.json
docker-compose.yml
Dockerfile
package.json
package-lock.json
.env.example
README.md
```
