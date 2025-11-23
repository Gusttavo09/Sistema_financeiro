const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();



const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CONEXÃO COM BANCO 
const db = mysql.createConnection({
  port: process.env.DATABSE_PORT,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao MySQL!');
});

// ALGORITMOS DE ORDENAÇÃO 

/**
  QuickSort - Divisão e Conquista
 */
// orderBy: 'biggerValue', 'lowerValue', 'newestDate', 'oldestDate'
function quickSortValor(arr, orderBy) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  console.log(arr.length, orderBy)
  for (let i = 0; i < arr.length - 1; i++) {
    // console.log(pivot, left, right)
    if (orderBy === 'biggerValue') {
      console.log("aqui no big")
      console.log(`linha: ${i} valor: ${arr[i].valor}, left:${JSON.stringify(left.map((item) => item.valor))},  pivot: ${pivot.valor}, right:${JSON.stringify(right.map((item) => item.valor))}`)
      if (Number(arr[i].valor) > Number(pivot.valor)) left.push(arr[i]);
      else right.push(arr[i]);
    } else if (orderBy === 'lowerValue') {
      console.log("aqui no low")
      console.log(`linha: ${i} valor: ${arr[i].valor}, left:${JSON.stringify(left.map((item) => item.valor))},  pivot: ${pivot.valor}, right:${JSON.stringify(right.map((item) => item.valor))}`)
      if (Number(arr[i].valor) < Number(pivot.valor)) left.push(arr[i]);
      else right.push(arr[i]);
    } else if (orderBy === 'newestDate') {
      console.log("aqui no new")
      if (new Date(arr[i].data) > new Date(pivot.data)) left.push(arr[i]);
      else right.push(arr[i]);
    } else if (orderBy === 'oldestDate') {
      console.log("aqui no old")
      if (new Date(arr[i].data) < new Date(pivot.data)) left.push(arr[i]);
      else right.push(arr[i]);
    }
  }
  return [...quickSortValor(left, orderBy), pivot, ...quickSortValor(right, orderBy)];
}

// ALGORITMOS DE BUSCA 


/**
Busca Linear
 */
function linearSearch(arr, target, key = 'descricao') {
  let comparisons = 0;
  const result = []
  for (let item of arr) {
    comparisons++;
    if (item[key].toLowerCase().includes(target.toLowerCase())) {
      result.push(item);
    }
  }

  return { result, comparisons };
}



app.get('/transacoes', (req, res) => {
  const { orderBy } = req.query

  console.log(orderBy)

  const sql = 'SELECT * FROM transacoes';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    const orderData = quickSortValor(results, orderBy)
    res.json(orderData);
  });
});


app.get('/transacoes/:id', (req, res) => {
  const sql = 'SELECT * FROM transacoes WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (results.length === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }
    res.json(results[0]);
  });
});


app.post('/transacoes', (req, res) => {
  const { descricao, valor, tipo, categoria, data } = req.body;
  const sql = 'INSERT INTO transacoes (descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [descricao, valor, tipo, categoria, data], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({
      mensagem: 'Transação criada com sucesso!',
      id: result.insertId
    });
  });
});

app.put('/transacoes/:id', (req, res) => {
  const { descricao, valor, tipo, categoria, data } = req.body;
  const sql = 'UPDATE transacoes SET descricao = ?, valor = ?, tipo = ?, categoria = ?, data = ? WHERE id = ?';

  db.query(sql, [descricao, valor, tipo, categoria, data, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }
    res.json({ mensagem: 'Transação atualizada com sucesso!' });
  });
});

app.delete('/transacoes/:id', (req, res) => {
  const sql = 'DELETE FROM transacoes WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }
    res.json({ mensagem: 'Transação deletada com sucesso!' });
  });
});

// BUSCA com diferentes algoritmos
app.get('/transacoes/busca/:descricao', (req, res) => {
  const { descricao } = req.params;

  const sql = 'SELECT * FROM transacoes;';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });

    const inicio = performance.now();


    const busca = linearSearch(results, descricao, 'descricao');
    const resultado = busca.result;

    const tempoExecucao = (performance.now() - inicio).toFixed(3);

    res.json({
      data: resultado,
      tempoExecucao: `${tempoExecucao}ms`,
    });
  });
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});