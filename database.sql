CREATE DATABASE
IF NOT EXISTS sistema_academico;
USE sistema_academico;

-- Tabela de Alunos
CREATE TABLE alunos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR
  (255) NOT NULL,
  idade VARCHAR
  (255),
  matricula INT,
  data_cadastro DATE,
  semestre INT,
  curso VARCHAR
);

-- Tabela de Disciplinas
CREATE TABLE disciplina (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR
(255) NOT NULL,
  curso VARCHAR
(255),
  codigo INT,
  professor VARCHAR,
  carga_horaria INT
);

-- Tabela de Matrículas 
CREATE TABLE matricula (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  disciplina_id INT NOT NULL,
  peso INT,
  nota FLOAT,
  data_cadastro DATE,
  FOREIGN KEY
(aluno_id) REFERENCES alunos
(id) ON
DELETE CASCADE,
  FOREIGN KEY (disciplina_id)
REFERENCES disciplina
(id) ON
DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO alunos
  (nome, idade, matricula, data_cadastro, semestre)
VALUES
  ('João Silva', '20', 2024001, '2024-01-15', 3),
  ('Maria Santos', '22', 2024002, '2024-01-15', 5),
  ('Pedro Oliveira', '19', 2024003, '2024-01-16', 2);

INSERT INTO disciplina
  (nome, curso, codigo)
VALUES
  ('Programação Web', 'Sistemas de Informação', 101),
  ('Banco de Dados', 'Sistemas de Informação', 102),
  ('Estrutura de Dados', 'Ciência da Computação', 103);

INSERT INTO matricula
  (aluno_id, disciplina_id, peso, nota, data_cadastro)
VALUES
  (1, 1, 10, 8.5, '2024-02-01'),
  (1, 2, 10, 9.0, '2024-02-01'),
  (2, 1, 10, 7.5, '2024-02-02'),
  (3, 3, 10, 8.0, '2024-02-03');