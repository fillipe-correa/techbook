DROP TABLE IF EXISTS devolucoes;
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS administradores;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS livros;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    usuario_id BIGINT PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE administradores (
    usuario_id BIGINT PRIMARY KEY,
    login VARCHAR(80) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE livros (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(180) NOT NULL,
    autor VARCHAR(120) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url VARCHAR(500),
    quantidade_total INT NOT NULL,
    quantidade_disponivel INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL'
);

CREATE TABLE reservas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL,
    livro_id BIGINT NOT NULL,
    data_reserva DATE NOT NULL,
    prazo_retirada DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(usuario_id),
    CONSTRAINT fk_reserva_livro FOREIGN KEY (livro_id) REFERENCES livros(id)
);

CREATE TABLE emprestimos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL,
    livro_id BIGINT NOT NULL,
    administrador_id BIGINT NOT NULL,
    reserva_id BIGINT,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    renovado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_emprestimo_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(usuario_id),
    CONSTRAINT fk_emprestimo_livro FOREIGN KEY (livro_id) REFERENCES livros(id),
    CONSTRAINT fk_emprestimo_admin FOREIGN KEY (administrador_id) REFERENCES administradores(usuario_id),
    CONSTRAINT fk_emprestimo_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);

CREATE TABLE devolucoes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    emprestimo_id BIGINT NOT NULL UNIQUE,
    administrador_id BIGINT NOT NULL,
    data_devolucao DATE NOT NULL,
    estado_livro VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_devolucao_emprestimo FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id),
    CONSTRAINT fk_devolucao_admin FOREIGN KEY (administrador_id) REFERENCES administradores(usuario_id)
);

INSERT INTO usuarios (id, nome, email, telefone) VALUES
(1, 'Marina Gestora', 'admin@techbook.com', '(11) 4000-1234'),
(2, 'Gabriel Souza', 'gabriel@techbook.com', '(11) 99876-1001'),
(3, 'Edina Martins', 'edina@techbook.com', '(11) 99876-1002'),
(4, 'Daniel Lima', 'daniel@techbook.com', '(11) 99876-1003');

INSERT INTO administradores (usuario_id, login, senha) VALUES
(1, 'admin', 'techbook123');

INSERT INTO clientes (usuario_id, cpf) VALUES
(2, '458.698.870-10'),
(3, '458.698.870-11'),
(4, '458.698.870-12');

INSERT INTO livros (id, titulo, autor, categoria, descricao, imagem_url, quantidade_total, quantidade_disponivel, status) VALUES
(1, 'Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 'Fantasia', 'O inicio da jornada de Harry em Hogwarts.', 'https://covers.openlibrary.org/b/isbn/9788532530783-L.jpg', 6, 4, 'DISPONIVEL'),
(2, 'Harry Potter e a Camara Secreta', 'J.K. Rowling', 'Fantasia', 'O segundo ano de Harry traz novos misterios.', 'https://covers.openlibrary.org/b/isbn/9788532511669-L.jpg', 5, 5, 'DISPONIVEL'),
(3, 'Harry Potter e o Prisioneiro de Azkaban', 'J.K. Rowling', 'Fantasia', 'Sirius Black escapa e Hogwarts entra em alerta.', 'https://covers.openlibrary.org/b/isbn/9788532512062-L.jpg', 4, 3, 'DISPONIVEL'),
(4, 'Dom Casmurro', 'Machado de Assis', 'Romance', 'Um classico da literatura brasileira.', 'https://covers.openlibrary.org/b/isbn/9788525412300-L.jpg', 3, 3, 'DISPONIVEL'),
(5, 'Clean Code', 'Robert C. Martin', 'Tecnologia', 'Boas praticas para desenvolvimento de software.', 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 2, 2, 'DISPONIVEL'),
(6, 'Entendendo Algoritmos', 'Aditya Bhargava', 'Tecnologia', 'Introducao visual a algoritmos e estruturas.', 'https://covers.openlibrary.org/b/isbn/9788575225638-L.jpg', 3, 2, 'DISPONIVEL');

INSERT INTO reservas (id, cliente_id, livro_id, data_reserva, prazo_retirada, status) VALUES
(1, 2, 1, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PENDENTE'),
(2, 3, 3, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PENDENTE');

INSERT INTO emprestimos (id, cliente_id, livro_id, administrador_id, reserva_id, data_emprestimo, data_devolucao_prevista, status, renovado) VALUES
(1, 4, 6, 1, NULL, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), 'ATIVO', FALSE),
(2, 2, 3, 1, NULL, DATE_SUB(CURRENT_DATE, INTERVAL 16 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'ATRASADO', TRUE);
