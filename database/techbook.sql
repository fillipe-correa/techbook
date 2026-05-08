-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Tempo de geração: 08-Maio-2026 às 02:09
-- Versão do servidor: 8.0.44
-- versão do PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de dados: `techbook`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `emprestimos`
--

CREATE TABLE `emprestimos` (
  `id` bigint NOT NULL,
  `administrador_id` bigint DEFAULT NULL,
  `data_devolucao_prevista` date DEFAULT NULL,
  `data_emprestimo` date DEFAULT NULL,
  `renovado` bit(1) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `cliente_id` bigint NOT NULL,
  `livro_id` bigint NOT NULL,
  `reserva_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `emprestimos`
--

INSERT INTO `emprestimos` (`id`, `administrador_id`, `data_devolucao_prevista`, `data_emprestimo`, `renovado`, `status`, `cliente_id`, `livro_id`, `reserva_id`) VALUES
(1, 1, '2026-04-22', '2026-04-08', b'0', 'ATRASADO', 1, 3, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `livros`
--

CREATE TABLE `livros` (
  `id` bigint NOT NULL,
  `autor` varchar(255) NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `descricao` varchar(2000) NOT NULL,
  `imagem_url` varchar(255) NOT NULL,
  `isbn` varchar(255) NOT NULL,
  `quantidade_disponivel` int NOT NULL,
  `quantidade_total` int NOT NULL,
  `titulo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `livros`
--

INSERT INTO `livros` (`id`, `autor`, `categoria`, `descricao`, `imagem_url`, `isbn`, `quantidade_disponivel`, `quantidade_total`, `titulo`) VALUES
(3, 'Suzanne Collins', 'Ficção científica', 'Primeiro volume da saga em que Katniss Everdeen entra nos Jogos Vorazes para sobreviver e desafiar Panem.', 'https://covers.openlibrary.org/b/id/12646537-L.jpg', 'ISBN-PENDENTE', 15, 15, 'Jogos Vorazes'),
(4, 'J.K. Rowling', 'Fantasia', 'Primeiro livro da série, em que Harry descobre o mundo da magia e inicia sua jornada em Hogwarts.', 'https://covers.openlibrary.org/b/id/15155833-L.jpg', 'ISBN-PENDENTE', 3, 3, 'Harry Potter e a Pedra Filosofal'),
(5, 'J.K. Rowling', 'Fantasia', 'Segundo volume da saga, em que Harry retorna a Hogwarts e enfrenta os segredos da Câmara Secreta.', 'https://covers.openlibrary.org/b/id/15158664-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e a Câmara Secreta'),
(6, 'J.K. Rowling', 'Fantasia', 'Terceiro livro da série, marcado pela fuga de Sirius Black e por novas revelações sobre o passado de Harry.', 'https://covers.openlibrary.org/b/id/10580435-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e o Prisioneiro de Azkaban'),
(7, 'J.K. Rowling', 'Fantasia', 'No Torneio Tribruxo, Harry é escolhido inesperadamente e enfrenta provas perigosas em Hogwarts.', 'https://covers.openlibrary.org/b/id/12059372-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e o Cálice de Fogo'),
(8, 'J.K. Rowling', 'Fantasia', 'Harry enfrenta a negação do retorno de Voldemort enquanto a Ordem da Fênix organiza a resistência.', 'https://covers.openlibrary.org/b/id/15158666-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e a Ordem da Fênix'),
(9, 'J.K. Rowling', 'Fantasia', 'Dumbledore conduz Harry por memórias decisivas sobre Voldemort e seus horcruxes.', 'https://covers.openlibrary.org/b/id/10716273-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e o Enigma do Príncipe'),
(10, 'J.K. Rowling', 'Fantasia', 'No desfecho da saga, Harry, Rony e Hermione deixam Hogwarts em busca dos horcruxes finais.', 'https://covers.openlibrary.org/b/id/15158660-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Harry Potter e as Relíquias da Morte'),
(11, 'Suzanne Collins', 'Ficção científica', 'Katniss e Peeta retornam à arena no Massacre Quaternário, enquanto a rebelião cresce em Panem.', 'https://covers.openlibrary.org/b/id/12646539-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Em Chamas'),
(12, 'Suzanne Collins', 'Ficção científica', 'Katniss se torna o símbolo da revolução contra a Capital no encerramento da trilogia original.', 'https://covers.openlibrary.org/b/id/12646459-L.jpg', 'ISBN-PENDENTE', 5, 5, 'A Esperança'),
(13, 'Suzanne Collins', 'Ficção científica', 'Prelúdio da saga que acompanha o jovem Coriolanus Snow antes de se tornar o tirano de Panem.', 'https://covers.openlibrary.org/b/id/14421833-L.jpg', 'ISBN-PENDENTE', 5, 5, 'A Cantiga dos Pássaros e das Serpentes'),
(14, 'Suzanne Collins', 'Ficção científica', 'Quinto livro da série Jogos Vorazes, centrado em Haymitch Abernathy durante o 50º Jogos Vorazes.', 'https://covers.openlibrary.org/b/id/15169776-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Amanhecer na Colheita'),
(15, 'Stephenie Meyer', 'Romance fantástico', 'Bella Swan se muda para Forks e conhece Edward Cullen, iniciando a saga Crepúsculo.', 'https://covers.openlibrary.org/b/id/12641977-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Crepúsculo'),
(16, 'Stephenie Meyer', 'Romance fantástico', 'No segundo livro da saga, Bella enfrenta a ausência de Edward e se aproxima ainda mais de Jacob.', 'https://covers.openlibrary.org/b/id/12643406-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Lua Nova'),
(17, 'Stephenie Meyer', 'Romance fantástico', 'Bella precisa escolher seu futuro enquanto vampiros e lobisomens enfrentam uma nova ameaça.', 'https://covers.openlibrary.org/b/id/12643410-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Eclipse'),
(18, 'Stephenie Meyer', 'Romance fantástico', 'Último volume da saga principal, acompanhando o casamento de Bella e Edward e suas consequências.', 'https://covers.openlibrary.org/b/id/12643419-L.jpg', 'ISBN-PENDENTE', 5, 5, 'Amanhecer'),
(19, 'Autor Teste', 'Teste', 'Livro criado apenas para validar o cadastro no painel administrativo.', 'https://covers.openlibrary.org/b/id/12646537-L.jpg', 'ISBN-PENDENTE', 2, 2, 'Livro Teste Cadastro');

-- --------------------------------------------------------

--
-- Estrutura da tabela `reservas`
--

CREATE TABLE `reservas` (
  `id` bigint NOT NULL,
  `data_reserva` date DEFAULT NULL,
  `prazo_retirada` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `cliente_id` bigint NOT NULL,
  `livro_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `reservas`
--

INSERT INTO `reservas` (`id`, `data_reserva`, `prazo_retirada`, `status`, `cliente_id`, `livro_id`) VALUES
(2, '2026-05-04', '2026-05-07', 'PENDENTE', 3, 9);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint NOT NULL,
  `cpf` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `telefone` varchar(255) NOT NULL,
  `senha_hash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `cpf`, `email`, `nome`, `telefone`, `senha_hash`) VALUES
(1, '11122233344', 'edino@techbook.local', 'Edino', '(11) 99999-6969', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'),
(2, '99988877766', 'cliente.teste.cadastro@techbook.local', 'Cliente Teste Cadastro', '(11) 98888-7766', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'),
(3, '44466319855', 'fillipecorrea07@gmail.com', 'Fillipe Correa', '11944490799', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKm0bg8i8ap68cpdg4w5egaqys3` (`cliente_id`),
  ADD KEY `FKljc60fwmihjgdsn2ee23yka0k` (`livro_id`),
  ADD KEY `FKpqasbmodp9xrq0v7f8n2c5tfw` (`reserva_id`);

--
-- Índices para tabela `livros`
--
ALTER TABLE `livros`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva_cliente_status` (`cliente_id`,`status`),
  ADD KEY `idx_reserva_livro_status` (`livro_id`,`status`),
  ADD KEY `idx_reserva_prazo_retirada` (`prazo_retirada`);

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK2et2smpfrtsohr7w9fe1v8a5e` (`cpf`),
  ADD UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `livros`
--
ALTER TABLE `livros`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  ADD CONSTRAINT `FKljc60fwmihjgdsn2ee23yka0k` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`),
  ADD CONSTRAINT `FKm0bg8i8ap68cpdg4w5egaqys3` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `FKpqasbmodp9xrq0v7f8n2c5tfw` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`);

--
-- Limitadores para a tabela `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `FK9ga67qjqyhc60u0f10tf7ssgo` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `FKm8r0gnqkusl5tloh2cfhig2fy` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
