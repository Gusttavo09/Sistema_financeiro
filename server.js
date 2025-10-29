const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express;
const PORT = 3000;

app.use(cors());
app.use(express.json);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sua_senha',
    database: 'sistema_academico'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar:', err);
        return;
    }
    console.log('Conectado ao MySQL!');
});

app.get('/alunos', (req, res) => {
    const sql = 'SELECT * FROM alunos';
    db.query(sql, (err, results) => {
        if (err){
            return res.status(500).json({erro:err.message});
        }
        res.json(results);
    });
});

app.get('/alunos/:id', (req, res) => {
    const sql = 'SELECT * FROM alunos WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) =>{
        if (err){
            return res.status(500).json({erro: err.message});
        }
        if (results.length ===0){
            return res.status(404). json({erro: 'Aluno Não encontrado'});
        }   
        res.json(results[0]);         
    });
});

// Criar novo aluno
app.post('/alunos', (req, res) =>{
    const {nome , idade, matricula, data_cadastro, semestre} = req.body;
    const sql = 'INSERT INTO alunos (nome, idade, matricula, data_cadstro, semestre) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [nome, idade, matricula, data_cadastro, semestre], (err, result) =>{
        if(err) {
            return res.status(500).json({erro: err.message });
        }
        res.status(201).json({ 
            mensagem: 'Aluno criado com sucesso!',
            id: result.insertId 
        });
    });
});

//Atualizar
app.put('/alunos/:id', (req, res) => {
    const { nome, idade, matricula, data_cadastro, semestre} = req.body;
    const sql = 'UPDATE alunos SET nome = ?, idade = ?, matricula = ?, data_cadastro = ?, semestre = ? WHERE id = ?';
    
    db.query(sql, [nome, idade, matricula, data_cadastro, semestre, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message});
        }
        if (result.affectedRows == 0){
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json({mensagem: 'Aluno atualizado com sucesso!' });
    });
});

// Deletar
app.delete('/alunos/:id', (req, res) => {
  const sql = 'DELETE FROM alunos WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    res.json({ mensagem: 'Aluno deletado com sucesso!' });
  });
});

// Parte das matrículas
// Listar todas as matrículas
app.get('/matriculas', (req, res) => {
  const sql = `
    SELECT m.*, a.nome as nome_aluno, d.nome as nome_disciplina
    FROM matricula m
    INNER JOIN alunos a ON m.aluno_id = a.id
    INNER JOIN disciplina d ON m.disciplina_id = d.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(results);
  });
});

// Matricular aluno em disciplina
app.post('/matriculas', (req, res) => {
  const { aluno_id, disciplina_id, peso, nota, data_cadastro } = req.body;
  const sql = 'INSERT INTO matricula (aluno_id, disciplina_id, peso, nota, data_cadastro) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [aluno_id, disciplina_id, peso, nota, data_cadastro], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ 
      mensagem: 'Matrícula realizada com sucesso!',
      id: result.insertId 
    });
  });
});

// Buscar Matrículas de um aluno
app.get('/alunos/:id/matriculas', (req, res) => {
  const sql = `
    SELECT m.*, d.nome as nome_disciplina, d.codigo, d.curso
    FROM matricula m
    INNER JOIN disciplina d ON m.disciplina_id = d.id
    WHERE m.aluno_id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(results);
  });
});

// Atualizar nota da matrícula
app.put('/matriculas/:id', (req, res) => {
  const { peso, nota } = req.body;
  const sql = 'UPDATE matricula SET peso = ?, nota = ? WHERE id = ?';
  
  db.query(sql, [peso, nota, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json({ mensagem: 'Nota atualizada com sucesso!' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});