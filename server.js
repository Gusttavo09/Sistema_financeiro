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

//o orderBy vai ter o valor biggerValue, lowerValue, oldestDate, newestDate
const ComparrisonMapper = {
  'biggerValue': '>',
  'lowerValue': '<',


}
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
      if (arr[i].valor > pivot.valor) left.push(arr[i]);
      else right.push(arr[i]);
    } else if (orderBy === 'lowerValue') {
      console.log("aqui no low")
      if (arr[i].valor < pivot.valor) left.push(arr[i]);
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

/**
 MergeSort - Divisão e Conquista
 */
function mergeSort(arr, key = 'media_notas') {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), key);
  const right = mergeSort(arr.slice(mid), key);

  return merge(left, right, key);
}

function merge(left, right, key) {
  let result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if ((left[i][key] || 0) >= (right[j][key] || 0)) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 HeapSort
 */
function heapSort(arr, key = 'media_notas') {
  const sorted = [...arr];
  const n = sorted.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(sorted, n, i, key);
  }

  for (let i = n - 1; i > 0; i--) {
    [sorted[0], sorted[i]] = [sorted[i], sorted[0]];
    heapify(sorted, i, 0, key);
  }

  return sorted.reverse();
}

function heapify(arr, n, i, key) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && (arr[left][key] || 0) > (arr[largest][key] || 0)) largest = left;
  if (right < n && (arr[right][key] || 0) > (arr[largest][key] || 0)) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest, key);
  }
}

/**
  BubbleSort (para comparação de algoritmos simples)
 */
function bubbleSort(arr, key = 'media_notas') {
  const sorted = [...arr];
  const n = sorted.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if ((sorted[j][key] || 0) < (sorted[j + 1][key] || 0)) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }

  return sorted;
}

// ALGORITMOS DE BUSCA 

/**
 Busca Binária
 */
function binarySearch(arr, target, key = 'matricula') {
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  while (left <= right) {
    comparisons++;
    const mid = Math.floor((left + right) / 2);

    if (arr[mid][key] === target) {
      return { result: arr[mid], comparisons };
    }
    if (arr[mid][key] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { result: null, comparisons };
}

/**
Busca Linear
 */
function linearSearch(arr, target, key = 'descricao') {
  let comparisons = 0;

  for (let item of arr) {
    comparisons++;
    if (item[key].includes(target)) {
      return { result: item, comparisons };
    }
  }

  return { result: null, comparisons };
}

/**
 * Hash Table para busca O(1) amortizado
 */
class HashTable {
  constructor() {
    this.table = new Map();
  }

  insert(key, value) {
    this.table.set(key, value);
  }

  search(key) {
    return this.table.get(key);
  }

  delete(key) {
    return this.table.delete(key);
  }

  size() {
    return this.table.size;
  }
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

  const sql = 'SELECT * FROM descricao';

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