-- Base de dados e seed inicial do CineRating
-- Executado automaticamente pelo MySQL no Docker quando o volume é criado pela primeira vez.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Filme_Plataforma;
DROP TABLE IF EXISTS Filme_Premios;
DROP TABLE IF EXISTS Watchlist;
DROP TABLE IF EXISTS Elenco_Filme;
DROP TABLE IF EXISTS Avaliacoes;
DROP TABLE IF EXISTS Filmes;
DROP TABLE IF EXISTS Plataformas;
DROP TABLE IF EXISTS Premios;
DROP TABLE IF EXISTS Utilizadores;
DROP TABLE IF EXISTS Pessoas;
DROP TABLE IF EXISTS Generos;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Generos (
    id_genero INT PRIMARY KEY AUTO_INCREMENT,
    nome_genero VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Pessoas (
    id_pessoa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE,
    nacionalidade VARCHAR(50),
    biografia TEXT
);

CREATE TABLE Utilizadores (
    id_utilizador INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'OAUTH_GITHUB',
    github_id VARCHAR(100) UNIQUE,
    nome_github VARCHAR(150),
    avatar_url VARCHAR(255),
    oauth_provider VARCHAR(30) NOT NULL DEFAULT 'local',
    data_registo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Premios (
    id_premio INT PRIMARY KEY AUTO_INCREMENT,
    nome_premio VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE Plataformas (
    id_plataforma INT PRIMARY KEY AUTO_INCREMENT,
    nome_plataforma VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Filmes (
    id_filme INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    ano_lancamento INT NOT NULL,
    duracao_minutos INT,
    sinopse TEXT,
    id_genero INT,
    CONSTRAINT fk_filme_genero
        FOREIGN KEY (id_genero)
        REFERENCES Generos(id_genero)
        ON DELETE SET NULL
);

CREATE TABLE Avaliacoes (
    id_avaliacao INT PRIMARY KEY AUTO_INCREMENT,
    id_filme INT NOT NULL,
    id_utilizador INT NOT NULL,
    nota INT NOT NULL CHECK (nota >= 0 AND nota <= 20),
    comentario TEXT,
	data_avaliacao DATE DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_avaliacao_filme
        FOREIGN KEY (id_filme)
        REFERENCES Filmes(id_filme)
        ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_utilizador
        FOREIGN KEY (id_utilizador)
        REFERENCES Utilizadores(id_utilizador)
        ON DELETE CASCADE,
    CONSTRAINT uk_utilizador_filme_avaliacao
        UNIQUE (id_filme, id_utilizador)
);

CREATE TABLE Elenco_Filme (
    id_filme INT NOT NULL,
    id_pessoa INT NOT NULL,
    papel VARCHAR(50) NOT NULL,
    personagem VARCHAR(100),
    PRIMARY KEY (id_filme, id_pessoa, papel),
    CONSTRAINT fk_elenco_filme
        FOREIGN KEY (id_filme)
        REFERENCES Filmes(id_filme)
        ON DELETE CASCADE,
    CONSTRAINT fk_elenco_pessoa
        FOREIGN KEY (id_pessoa)
        REFERENCES Pessoas(id_pessoa)
        ON DELETE CASCADE
);

CREATE TABLE Watchlist (
    id_utilizador INT NOT NULL,
    id_filme INT NOT NULL,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visto BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_utilizador, id_filme),
    CONSTRAINT fk_watchlist_utilizador
        FOREIGN KEY (id_utilizador)
        REFERENCES Utilizadores(id_utilizador)
        ON DELETE CASCADE,
    CONSTRAINT fk_watchlist_filme
        FOREIGN KEY (id_filme)
        REFERENCES Filmes(id_filme)
        ON DELETE CASCADE
);

CREATE TABLE Filme_Premios (
    id_filme INT NOT NULL,
    id_premio INT NOT NULL,
    ano_vitoria INT NOT NULL,
    PRIMARY KEY (id_filme, id_premio),
    CONSTRAINT fk_filme_premios_filme
        FOREIGN KEY (id_filme)
        REFERENCES Filmes(id_filme)
        ON DELETE CASCADE,
    CONSTRAINT fk_filme_premios_premio
        FOREIGN KEY (id_premio)
        REFERENCES Premios(id_premio)
        ON DELETE CASCADE
);

CREATE TABLE Filme_Plataforma (
    id_filme INT NOT NULL,
    id_plataforma INT NOT NULL,
    url_acesso VARCHAR(255),
    PRIMARY KEY (id_filme, id_plataforma),
    CONSTRAINT fk_filme_plataforma_filme
        FOREIGN KEY (id_filme)
        REFERENCES Filmes(id_filme)
        ON DELETE CASCADE,
    CONSTRAINT fk_filme_plataforma_plataforma
        FOREIGN KEY (id_plataforma)
        REFERENCES Plataformas(id_plataforma)
        ON DELETE CASCADE
);

-- =========================================================
-- SEED: 30 REGISTOS POR TABELA
-- =========================================================

INSERT INTO Generos (nome_genero) VALUES
('Drama'),
('Comédia'),
('Ação'),
('Ficção Científica'),
('Terror'),
('Romance'),
('Animação'),
('Documentário'),
('Thriller'),
('Fantasia'),
('Aventura'),
('Crime'),
('Musical'),
('Guerra'),
('Histórico'),
('Biografia'),
('Mistério'),
('Família'),
('Desporto'),
('Western'),
('Suspense Psicológico'),
('Super-heróis'),
('Policial'),
('Épico'),
('Independente'),
('Noir'),
('Distopia'),
('Artes Marciais'),
('Satírico'),
('Experimental');

INSERT INTO Plataformas (nome_plataforma) VALUES
('Netflix'),
('HBO Max'),
('Disney+'),
('Prime Video'),
('Apple TV+'),
('SkyShowtime'),
('Filmin'),
('MUBI'),
('Rakuten TV'),
('YouTube Movies'),
('Google TV'),
('Pluto TV'),
('RTP Play'),
('Globoplay'),
('Crunchyroll'),
('Paramount+'),
('Lionsgate+'),
('Tubi'),
('Plex'),
('Canal Hollywood'),
('AXN Now'),
('Cinemundo'),
('NOS Play'),
('Vodafone TV'),
('Meo Filmes'),
('Starz'),
('Vimeo On Demand'),
('BFI Player'),
('Criterion Channel'),
('Cine Europa');

INSERT INTO Premios (nome_premio, categoria) VALUES
('Oscar', 'Melhor Filme'),
('Oscar', 'Melhor Realizador'),
('Oscar', 'Melhor Ator'),
('Oscar', 'Melhor Atriz'),
('Oscar', 'Melhor Argumento'),
('Globo de Ouro', 'Melhor Filme Dramático'),
('Globo de Ouro', 'Melhor Comédia'),
('Globo de Ouro', 'Melhor Realizador'),
('BAFTA', 'Melhor Filme'),
('BAFTA', 'Melhor Fotografia'),
('Cannes', 'Palma de Ouro'),
('Cannes', 'Melhor Realizador'),
('Veneza', 'Leão de Ouro'),
('Berlim', 'Urso de Ouro'),
('Sundance', 'Prémio do Júri'),
('César', 'Melhor Filme Estrangeiro'),
('Goya', 'Melhor Filme Europeu'),
('European Film Awards', 'Melhor Filme'),
('Critics Choice', 'Melhor Elenco'),
('Saturn Awards', 'Melhor Ficção Científica'),
('Annie Awards', 'Melhor Animação'),
('Independent Spirit', 'Melhor Filme Independente'),
('MTV Movie Awards', 'Melhor Cena de Ação'),
('People''s Choice', 'Filme Favorito'),
('Grammy', 'Melhor Banda Sonora'),
('Screen Actors Guild', 'Melhor Elenco'),
('Toronto', 'Prémio do Público'),
('Locarno', 'Leopardo de Ouro'),
('Rotterdam', 'Tiger Award'),
('Lisboa Film Fest', 'Melhor Filme Português');

INSERT INTO Pessoas (nome, data_nascimento, nacionalidade, biografia) VALUES
('Christopher Nolan', '1961-02-02', 'Britânica', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Greta Gerwig', '1962-03-03', 'Americana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Denis Villeneuve', '1963-04-04', 'Francesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Sofia Coppola', '1964-05-05', 'Espanhola', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Jordan Peele', '1965-06-06', 'Canadiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Martin Scorsese', '1966-07-07', 'Sul-coreana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Quentin Tarantino', '1967-08-08', 'Mexicana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Steven Spielberg', '1968-09-09', 'Italiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Patty Jenkins', '1969-10-10', 'Alemã', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Bong Joon-ho', '1970-11-11', 'Portuguesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Pedro Almodóvar', '1971-12-12', 'Britânica', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Guillermo del Toro', '1972-01-13', 'Americana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('James Cameron', '1973-02-14', 'Francesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Ridley Scott', '1974-03-15', 'Espanhola', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Chloé Zhao', '1975-04-16', 'Canadiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Taika Waititi', '1976-05-17', 'Sul-coreana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Wes Anderson', '1977-06-18', 'Mexicana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Ava DuVernay', '1978-07-19', 'Italiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('David Fincher', '1979-08-20', 'Alemã', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('M. Night Shyamalan', '1980-09-21', 'Portuguesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Cillian Murphy', '1981-10-22', 'Britânica', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Margot Robbie', '1982-11-23', 'Americana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Zendaya Coleman', '1983-12-24', 'Francesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Tom Hardy', '1984-01-25', 'Espanhola', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Viola Davis', '1985-02-26', 'Canadiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Florence Pugh', '1986-03-27', 'Sul-coreana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Ryan Gosling', '1987-04-01', 'Mexicana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Emma Stone', '1988-05-02', 'Italiana', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Denzel Washington', '1989-06-03', 'Alemã', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.'),
('Saoirse Ronan', '1990-07-04', 'Portuguesa', 'Profissional de cinema associado a filmes de referência no catálogo CineRating.');

INSERT INTO Utilizadores (username, email, password_hash) VALUES
('user01', 'user01@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user02', 'user02@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user03', 'user03@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user04', 'user04@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user05', 'user05@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user06', 'user06@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user07', 'user07@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user08', 'user08@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user09', 'user09@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user10', 'user10@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user11', 'user11@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user12', 'user12@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user13', 'user13@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user14', 'user14@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user15', 'user15@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user16', 'user16@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user17', 'user17@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user18', 'user18@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user19', 'user19@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user20', 'user20@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user21', 'user21@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user22', 'user22@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user23', 'user23@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user24', 'user24@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user25', 'user25@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user26', 'user26@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user27', 'user27@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user28', 'user28@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user29', 'user29@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345'),
('user30', 'user30@exemplo.pt', '$2b$10$abcdefghijklmnopqrstuuYJrHnWmGkC5dfakehashParaDemo12345');

INSERT INTO Filmes (titulo, ano_lancamento, duracao_minutos, sinopse, id_genero) VALUES
('Oppenheimer', 2023, 180, 'A história do cientista que liderou o projecto da bomba atómica.', 16),
('Barbie', 2023, 114, 'Uma boneca descobre o mundo real e questiona a sua identidade.', 2),
('Dune', 2021, 155, 'Um jovem herdeiro enfrenta conflitos políticos num planeta desértico.', 4),
('A Cidade Perdida', 2022, 112, 'Uma escritora entra numa aventura inesperada.', 11),
('Noite Silenciosa', 2020, 96, 'Um grupo de amigos enfrenta acontecimentos estranhos numa casa isolada.', 5),
('Amor em Lisboa', 2024, 105, 'Dois jovens reencontram-se numa cidade cheia de memórias.', 6),
('Planeta Azul', 2019, 90, 'Documentário sobre os oceanos e a preservação ambiental.', 8),
('O Último Caso', 2021, 128, 'Um detective investiga um crime que parece impossível.', 12),
('Sonhos de Verão', 2018, 101, 'Uma família redescobre laços durante as férias.', 18),
('Império das Sombras', 2020, 140, 'Intriga política num reino em guerra.', 10),
('Velocidade Final', 2022, 118, 'Uma equipa tenta impedir um ataque tecnológico.', 3),
('A Melodia Perdida', 2017, 122, 'Um músico procura a inspiração que perdeu.', 13),
('A Ponte', 2016, 110, 'História de coragem durante um conflito militar.', 14),
('Reis e Cinzas', 2021, 150, 'Drama histórico sobre poder e traição.', 15),
('Luz de Inverno', 2019, 98, 'Uma biografia íntima de uma artista esquecida.', 16),
('Enigma', 2023, 116, 'Um professor descobre uma mensagem codificada.', 17),
('O Pequeno Herói', 2020, 88, 'Animação sobre coragem e amizade.', 7),
('Final do Campeonato', 2022, 109, 'Uma equipa modesta luta pelo título nacional.', 19),
('O Vale Seco', 2015, 103, 'Um forasteiro chega a uma vila dominada pelo medo.', 20),
('Mente Dividida', 2021, 111, 'Um homem perde a noção entre memória e realidade.', 21),
('Guardião da Cidade', 2024, 124, 'Um herói improvável protege a cidade.', 22),
('Rua Sem Saída', 2018, 117, 'Investigação policial numa comunidade fechada.', 23),
('A Grande Jornada', 2023, 162, 'Uma família atravessa continentes em busca de liberdade.', 24),
('Cinema de Bairro', 2017, 95, 'Retrato independente de um pequeno cinema local.', 25),
('Chuva Negra', 2016, 108, 'Um thriller noir passado numa cidade chuvosa.', 26),
('Ano 2099', 2022, 132, 'Uma sociedade futurista vive sob controlo absoluto.', 27),
('Punhos de Honra', 2019, 104, 'Um mestre ensina disciplina a um jovem rebelde.', 28),
('Riso Amargo', 2021, 99, 'Uma sátira sobre fama e redes sociais.', 29),
('Fragmentos', 2020, 85, 'Experiência visual sobre memória e identidade.', 30),
('Horizonte Aberto', 2024, 120, 'Uma aventura humana sobre esperança e recomeço.', 11);

INSERT INTO Avaliacoes (id_filme, id_utilizador, nota, comentario, data_avaliacao) VALUES
(1, 8, 11, 'Avaliação 1: opinião registada pelo utilizador sobre o filme.', '2026-04-02'),
(2, 9, 12, 'Avaliação 2: opinião registada pelo utilizador sobre o filme.', '2026-04-03'),
(3, 10, 13, 'Avaliação 3: opinião registada pelo utilizador sobre o filme.', '2026-04-04'),
(4, 11, 14, 'Avaliação 4: opinião registada pelo utilizador sobre o filme.', '2026-04-05'),
(5, 12, 15, 'Avaliação 5: opinião registada pelo utilizador sobre o filme.', '2026-04-06'),
(6, 13, 16, 'Avaliação 6: opinião registada pelo utilizador sobre o filme.', '2026-04-07'),
(7, 14, 17, 'Avaliação 7: opinião registada pelo utilizador sobre o filme.', '2026-04-08'),
(8, 15, 18, 'Avaliação 8: opinião registada pelo utilizador sobre o filme.', '2026-04-09'),
(9, 16, 19, 'Avaliação 9: opinião registada pelo utilizador sobre o filme.', '2026-04-10'),
(10, 17, 20, 'Avaliação 10: opinião registada pelo utilizador sobre o filme.', '2026-04-11'),
(11, 18, 10, 'Avaliação 11: opinião registada pelo utilizador sobre o filme.', '2026-04-12'),
(12, 19, 11, 'Avaliação 12: opinião registada pelo utilizador sobre o filme.', '2026-04-13'),
(13, 20, 12, 'Avaliação 13: opinião registada pelo utilizador sobre o filme.', '2026-04-14'),
(14, 21, 13, 'Avaliação 14: opinião registada pelo utilizador sobre o filme.', '2026-04-15'),
(15, 22, 14, 'Avaliação 15: opinião registada pelo utilizador sobre o filme.', '2026-04-16'),
(16, 23, 15, 'Avaliação 16: opinião registada pelo utilizador sobre o filme.', '2026-04-17'),
(17, 24, 16, 'Avaliação 17: opinião registada pelo utilizador sobre o filme.', '2026-04-18'),
(18, 25, 17, 'Avaliação 18: opinião registada pelo utilizador sobre o filme.', '2026-04-19'),
(19, 26, 18, 'Avaliação 19: opinião registada pelo utilizador sobre o filme.', '2026-04-20'),
(20, 27, 19, 'Avaliação 20: opinião registada pelo utilizador sobre o filme.', '2026-04-21'),
(21, 28, 20, 'Avaliação 21: opinião registada pelo utilizador sobre o filme.', '2026-04-22'),
(22, 29, 10, 'Avaliação 22: opinião registada pelo utilizador sobre o filme.', '2026-04-23'),
(23, 30, 11, 'Avaliação 23: opinião registada pelo utilizador sobre o filme.', '2026-04-24'),
(24, 1, 12, 'Avaliação 24: opinião registada pelo utilizador sobre o filme.', '2026-04-25'),
(25, 2, 13, 'Avaliação 25: opinião registada pelo utilizador sobre o filme.', '2026-04-26'),
(26, 3, 14, 'Avaliação 26: opinião registada pelo utilizador sobre o filme.', '2026-04-27'),
(27, 4, 15, 'Avaliação 27: opinião registada pelo utilizador sobre o filme.', '2026-04-28'),
(28, 5, 16, 'Avaliação 28: opinião registada pelo utilizador sobre o filme.', '2026-04-01'),
(29, 6, 17, 'Avaliação 29: opinião registada pelo utilizador sobre o filme.', '2026-04-02'),
(30, 7, 18, 'Avaliação 30: opinião registada pelo utilizador sobre o filme.', '2026-04-03');

INSERT INTO Elenco_Filme (id_filme, id_pessoa, papel, personagem) VALUES
(1, 1, 'Atriz', 'Personagem 1'),
(2, 2, 'Realizador', 'Equipa técnica'),
(3, 3, 'Argumentista', 'Equipa técnica'),
(4, 4, 'Produtor', 'Equipa técnica'),
(5, 5, 'Ator', 'Personagem 5'),
(6, 6, 'Atriz', 'Personagem 6'),
(7, 7, 'Realizador', 'Equipa técnica'),
(8, 8, 'Argumentista', 'Equipa técnica'),
(9, 9, 'Produtor', 'Equipa técnica'),
(10, 10, 'Ator', 'Personagem 10'),
(11, 11, 'Atriz', 'Personagem 11'),
(12, 12, 'Realizador', 'Equipa técnica'),
(13, 13, 'Argumentista', 'Equipa técnica'),
(14, 14, 'Produtor', 'Equipa técnica'),
(15, 15, 'Ator', 'Personagem 15'),
(16, 16, 'Atriz', 'Personagem 16'),
(17, 17, 'Realizador', 'Equipa técnica'),
(18, 18, 'Argumentista', 'Equipa técnica'),
(19, 19, 'Produtor', 'Equipa técnica'),
(20, 20, 'Ator', 'Personagem 20'),
(21, 21, 'Atriz', 'Personagem 21'),
(22, 22, 'Realizador', 'Equipa técnica'),
(23, 23, 'Argumentista', 'Equipa técnica'),
(24, 24, 'Produtor', 'Equipa técnica'),
(25, 25, 'Ator', 'Personagem 25'),
(26, 26, 'Atriz', 'Personagem 26'),
(27, 27, 'Realizador', 'Equipa técnica'),
(28, 28, 'Argumentista', 'Equipa técnica'),
(29, 29, 'Produtor', 'Equipa técnica'),
(30, 30, 'Ator', 'Personagem 30');

INSERT INTO Watchlist (id_utilizador, id_filme, data_adicionado, visto) VALUES
(1, 11, '2026-03-02 10:00:00', FALSE),
(2, 12, '2026-03-03 10:00:00', FALSE),
(3, 13, '2026-03-04 10:00:00', TRUE),
(4, 14, '2026-03-05 10:00:00', FALSE),
(5, 15, '2026-03-06 10:00:00', FALSE),
(6, 16, '2026-03-07 10:00:00', TRUE),
(7, 17, '2026-03-08 10:00:00', FALSE),
(8, 18, '2026-03-09 10:00:00', FALSE),
(9, 19, '2026-03-10 10:00:00', TRUE),
(10, 20, '2026-03-11 10:00:00', FALSE),
(11, 21, '2026-03-12 10:00:00', FALSE),
(12, 22, '2026-03-13 10:00:00', TRUE),
(13, 23, '2026-03-14 10:00:00', FALSE),
(14, 24, '2026-03-15 10:00:00', FALSE),
(15, 25, '2026-03-16 10:00:00', TRUE),
(16, 26, '2026-03-17 10:00:00', FALSE),
(17, 27, '2026-03-18 10:00:00', FALSE),
(18, 28, '2026-03-19 10:00:00', TRUE),
(19, 29, '2026-03-20 10:00:00', FALSE),
(20, 30, '2026-03-21 10:00:00', FALSE),
(21, 1, '2026-03-22 10:00:00', TRUE),
(22, 2, '2026-03-23 10:00:00', FALSE),
(23, 3, '2026-03-24 10:00:00', FALSE),
(24, 4, '2026-03-25 10:00:00', TRUE),
(25, 5, '2026-03-26 10:00:00', FALSE),
(26, 6, '2026-03-27 10:00:00', FALSE),
(27, 7, '2026-03-28 10:00:00', TRUE),
(28, 8, '2026-03-01 10:00:00', FALSE),
(29, 9, '2026-03-02 10:00:00', FALSE),
(30, 10, '2026-03-03 10:00:00', TRUE);

INSERT INTO Filme_Premios (id_filme, id_premio, ano_vitoria) VALUES
(1, 1, 2011),
(2, 2, 2012),
(3, 3, 2013),
(4, 4, 2014),
(5, 5, 2015),
(6, 6, 2016),
(7, 7, 2017),
(8, 8, 2018),
(9, 9, 2019),
(10, 10, 2020),
(11, 11, 2021),
(12, 12, 2022),
(13, 13, 2023),
(14, 14, 2024),
(15, 15, 2025),
(16, 16, 2010),
(17, 17, 2011),
(18, 18, 2012),
(19, 19, 2013),
(20, 20, 2014),
(21, 21, 2015),
(22, 22, 2016),
(23, 23, 2017),
(24, 24, 2018),
(25, 25, 2019),
(26, 26, 2020),
(27, 27, 2021),
(28, 28, 2022),
(29, 29, 2023),
(30, 30, 2024);

INSERT INTO Filme_Plataforma (id_filme, id_plataforma, url_acesso) VALUES
(1, 1, 'https://streaming.exemplo.pt/filmes/1'),
(2, 2, 'https://streaming.exemplo.pt/filmes/2'),
(3, 3, 'https://streaming.exemplo.pt/filmes/3'),
(4, 4, 'https://streaming.exemplo.pt/filmes/4'),
(5, 5, 'https://streaming.exemplo.pt/filmes/5'),
(6, 6, 'https://streaming.exemplo.pt/filmes/6'),
(7, 7, 'https://streaming.exemplo.pt/filmes/7'),
(8, 8, 'https://streaming.exemplo.pt/filmes/8'),
(9, 9, 'https://streaming.exemplo.pt/filmes/9'),
(10, 10, 'https://streaming.exemplo.pt/filmes/10'),
(11, 11, 'https://streaming.exemplo.pt/filmes/11'),
(12, 12, 'https://streaming.exemplo.pt/filmes/12'),
(13, 13, 'https://streaming.exemplo.pt/filmes/13'),
(14, 14, 'https://streaming.exemplo.pt/filmes/14'),
(15, 15, 'https://streaming.exemplo.pt/filmes/15'),
(16, 16, 'https://streaming.exemplo.pt/filmes/16'),
(17, 17, 'https://streaming.exemplo.pt/filmes/17'),
(18, 18, 'https://streaming.exemplo.pt/filmes/18'),
(19, 19, 'https://streaming.exemplo.pt/filmes/19'),
(20, 20, 'https://streaming.exemplo.pt/filmes/20'),
(21, 21, 'https://streaming.exemplo.pt/filmes/21'),
(22, 22, 'https://streaming.exemplo.pt/filmes/22'),
(23, 23, 'https://streaming.exemplo.pt/filmes/23'),
(24, 24, 'https://streaming.exemplo.pt/filmes/24'),
(25, 25, 'https://streaming.exemplo.pt/filmes/25'),
(26, 26, 'https://streaming.exemplo.pt/filmes/26'),
(27, 27, 'https://streaming.exemplo.pt/filmes/27'),
(28, 28, 'https://streaming.exemplo.pt/filmes/28'),
(29, 29, 'https://streaming.exemplo.pt/filmes/29'),
(30, 30, 'https://streaming.exemplo.pt/filmes/30');
