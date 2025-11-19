const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CONEXÃO COM BANCO 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'sistema_academico'
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
 * QuickSort - Divisão e Conquista
 * Complexidade: O(n log n) médio, O(n²) pior caso
 * Espaço: O(log n)
 */
function quickSort(arr, key = 'media_notas') {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(item => (item[key] || 0) > (pivot[key] || 0));
  const middle = arr.filter(item => (item[key] || 0) === (pivot[key] || 0));
  const right = arr.filter(item => (item[key] || 0) < (pivot[key] || 0));
  
  return [...quickSort(left, key), ...middle, ...quickSort(right, key)];
}

/**
 * MergeSort - Divisão e Conquista
 * Complexidade: O(n log n) em todos os casos
 * Espaço: O(n)
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
 * HeapSort
 * Complexidade: O(n log n) em todos os casos
 * Espaço: O(1)
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
 * BubbleSort (para comparação de algoritmos simples)
 * Complexidade: O(n²)
 * Espaço: O(1)
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
 * Busca Binária
 * Complexidade: O(log n)
 * Requer array ordenado
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
 * Busca Linear
 * Complexidade: O(n)
 */
function linearSearch(arr, target, key = 'matricula') {
  let comparisons = 0;
  
  for (let item of arr) {
    comparisons++;
    if (item[key] === target) {
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

// ANÁLISE ESTATÍSTICA 

/**
 * Calcula estatísticas completas
 * Complexidade: O(n log n) devido à ordenação para mediana
 */
function calcularEstatisticas(notas) {
  if (notas.length === 0) return null;
  
  // Média - O(n)
  const media = notas.reduce((sum, n) => sum + n, 0) / notas.length;
  
  // Mediana - O(n log n)
  const sorted = [...notas].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const mediana = sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
  
  // Máximo e Mínimo - O(n)
  const maximo = Math.max(...notas);
  const minimo = Math.min(...notas);
  
  // Desvio Padrão - O(n)
  const variancia = notas.reduce((sum, n) => sum + Math.pow(n - media, 2), 0) / notas.length;
  const desvioPadrao = Math.sqrt(variancia);
  
  // Moda - O(n)
  const frequencias = {};
  notas.forEach(n => frequencias[n] = (frequencias[n] || 0) + 1);
  const moda = Object.keys(frequencias).reduce((a, b) => 
    frequencias[a] > frequencias[b] ? a : b
  );
  
  // Quartis - O(n log n)
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  
  return { 
    media, 
    mediana, 
    maximo, 
    minimo, 
    desvioPadrao, 
    moda: parseFloat(moda),
    q1,
    q3,
    total: notas.length
  };
}

// ROTAS CRUD BÁSICAS 

// Listar todos os alunos
app.get('/alunos', (req, res) => {
  const sql = 'SELECT * FROM alunos ORDER BY nome';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Buscar aluno por ID
app.get('/alunos/:id', (req, res) => {
  const sql = 'SELECT * FROM alunos WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (results.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    res.json(results[0]);
  });
});

// Criar aluno
app.post('/alunos', (req, res) => {
  const { nome, idade, matricula, data_cadastro, semestre, curso } = req.body;
  const sql = 'INSERT INTO alunos (nome, idade, matricula, data_cadastro, semestre, curso) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [nome, idade, matricula, data_cadastro, semestre, curso || 'Sistemas de Informação'], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ 
      mensagem: 'Aluno criado com sucesso!',
      id: result.insertId 
    });
  });
});

// Atualizar aluno
app.put('/alunos/:id', (req, res) => {
  const { nome, idade, matricula, data_cadastro, semestre, curso } = req.body;
  const sql = 'UPDATE alunos SET nome = ?, idade = ?, matricula = ?, data_cadastro = ?, semestre = ?, curso = ? WHERE id = ?';
  
  db.query(sql, [nome, idade, matricula, data_cadastro, semestre, curso, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    res.json({ mensagem: 'Aluno atualizado com sucesso!' });
  });
});

// Deletar aluno
app.delete('/alunos/:id', (req, res) => {
  const sql = 'DELETE FROM alunos WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    res.json({ mensagem: 'Aluno deletado com sucesso!' });
  });
});

// Listar disciplinas
app.get('/disciplinas', (req, res) => {
  const sql = 'SELECT * FROM disciplina ORDER BY nome';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Criar disciplina
app.post('/disciplinas', (req, res) => {
  const { nome, curso, codigo, professor, carga_horaria } = req.body;
  const sql = 'INSERT INTO disciplina (nome, curso, codigo, professor, carga_horaria) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [nome, curso, codigo, professor, carga_horaria || 60], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ 
      mensagem: 'Disciplina criada com sucesso!',
      id: result.insertId 
    });
  });
});

// Listar matrículas
app.get('/matriculas', (req, res) => {
  const sql = `
    SELECT m.*, a.nome as nome_aluno, a.matricula as mat_aluno, 
           d.nome as nome_disciplina, d.codigo, d.professor
    FROM matricula m
    INNER JOIN alunos a ON m.aluno_id = a.id
    INNER JOIN disciplina d ON m.disciplina_id = d.id
    ORDER BY m.data_cadastro DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Criar matrícula
app.post('/matriculas', (req, res) => {
  const { aluno_id, disciplina_id, peso, nota, data_cadastro, status } = req.body;
  const sql = 'INSERT INTO matricula (aluno_id, disciplina_id, peso, nota, data_cadastro, status) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [aluno_id, disciplina_id, peso, nota, data_cadastro, status || 'Cursando'], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ 
      mensagem: 'Matrícula realizada com sucesso!',
      id: result.insertId 
    });
  });
});

// Atualizar nota da matrícula
app.put('/matriculas/:id', (req, res) => {
  const { peso, nota, status } = req.body;
  const sql = 'UPDATE matricula SET peso = ?, nota = ?, status = ? WHERE id = ?';
  
  db.query(sql, [peso, nota, status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Matrícula atualizada com sucesso!' });
  });
});

// ROTAS AVANÇADAS
// RANKING com diferentes algoritmos de ordenação
app.get('/ranking/:algoritmo', (req, res) => {
  const { algoritmo } = req.params;
  
  const sql = `
    SELECT a.id, a.nome, a.matricula, a.curso, a.semestre,
           AVG(m.nota) as media_notas, 
           COUNT(m.id) as total_disciplinas,
           SUM(CASE WHEN m.nota >= 7.0 THEN 1 ELSE 0 END) as aprovacoes
    FROM alunos a
    LEFT JOIN matricula m ON a.id = m.aluno_id
    GROUP BY a.id
    HAVING media_notas IS NOT NULL
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    const inicio = performance.now();
    let ranking;
    let complexidade;
    
    switch(algoritmo.toLowerCase()) {
      case 'quicksort':
        ranking = quickSort(results, 'media_notas');
        complexidade = 'O(n log n) médio, O(n²) pior caso';
        break;
      case 'mergesort':
        ranking = mergeSort(results, 'media_notas');
        complexidade = 'O(n log n) garantido';
        break;
      case 'heapsort':
        ranking = heapSort(results, 'media_notas');
        complexidade = 'O(n log n) garantido';
        break;
      case 'bubblesort':
        ranking = bubbleSort(results, 'media_notas');
        complexidade = 'O(n²)';
        break;
      default:
        ranking = results.sort((a, b) => (b.media_notas || 0) - (a.media_notas || 0));
        complexidade = 'O(n log n) - Sort nativo';
    }
    
    const tempoExecucao = (performance.now() - inicio).toFixed(3);
    
    // Adicionar posição no ranking
    ranking = ranking.map((aluno, index) => ({
      ...aluno,
      posicao: index + 1
    }));
    
    res.json({
      ranking,
      algoritmo: algoritmo.toUpperCase(),
      tempoExecucao: `${tempoExecucao}ms`,
      totalAlunos: ranking.length,
      complexidade,
      melhorAluno: ranking[0] || null,
      top3: ranking.slice(0, 3)
    });
  });
});

// BUSCA com diferentes algoritmos
app.get('/busca/:tipo/:valor', (req, res) => {
  const { tipo, valor } = req.params;
  
  const sql = 'SELECT * FROM alunos ORDER BY matricula';
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    const inicio = performance.now();
    let resultado;
    let complexidade;
    let comparacoes = 0;
    
    if (tipo === 'binaria') {
      const busca = binarySearch(results, parseInt(valor), 'matricula');
      resultado = busca.result;
      comparacoes = busca.comparisons;
      complexidade = 'O(log n)';
    } else if (tipo === 'linear') {
      const busca = linearSearch(results, parseInt(valor), 'matricula');
      resultado = busca.result;
      comparacoes = busca.comparisons;
      complexidade = 'O(n)';
    } else if (tipo === 'nome') {
      const termo = valor.toLowerCase();
      resultado = results.filter(a => a.nome.toLowerCase().includes(termo));
      comparacoes = results.length;
      complexidade = 'O(n)';
    } else if (tipo === 'hash') {
      // Simulação de hash table
      const hashTable = new HashTable();
      results.forEach(a => hashTable.insert(a.matricula, a));
      resultado = hashTable.search(parseInt(valor));
      comparacoes = 1;
      complexidade = 'O(1) amortizado';
    }
    
    const tempoExecucao = (performance.now() - inicio).toFixed(3);
    
    res.json({
      resultado,
      tipo,
      valor,
      tempoExecucao: `${tempoExecucao}ms`,
      complexidade,
      comparacoes,
      totalRegistros: results.length
    });
  });
});

// ESTATÍSTICAS gerais
app.get('/estatisticas', (req, res) => {
  const sql = 'SELECT nota FROM matricula WHERE nota IS NOT NULL';
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    const notas = results.map(r => parseFloat(r.nota));
    const stats = calcularEstatisticas(notas);
    
    // Distribuição de notas
    const distribuicao = {
      '0-4': notas.filter(n => n < 4).length,
      '4-7': notas.filter(n => n >= 4 && n < 7).length,
      '7-9': notas.filter(n => n >= 7 && n < 9).length,
      '9-10': notas.filter(n => n >= 9).length
    };
    
    res.json({
      estatisticas: stats,
      distribuicao,
      totalNotas: notas.length,
      aprovados: notas.filter(n => n >= 7).length,
      reprovados: notas.filter(n => n < 7).length,
      taxaAprovacao: ((notas.filter(n => n >= 7).length / notas.length) * 100).toFixed(2) + '%',
      complexidade: {
        media: 'O(n)',
        mediana: 'O(n log n)',
        maxMin: 'O(n)',
        desvioPadrao: 'O(n)',
        moda: 'O(n)'
      }
    });
  });
});

// ESTATÍSTICAS por disciplina
app.get('/estatisticas/disciplina/:id', (req, res) => {
  const sql = `
    SELECT m.nota, d.nome as disciplina, d.professor, COUNT(*) as total_alunos
    FROM matricula m
    INNER JOIN disciplina d ON m.disciplina_id = d.id
    WHERE d.id = ? AND m.nota IS NOT NULL
    GROUP BY m.nota, d.nome, d.professor
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    if (results.length === 0) {
      return res.json({ erro: 'Nenhuma nota encontrada para esta disciplina' });
    }
    
    const notas = results.map(r => parseFloat(r.nota));
    const stats = calcularEstatisticas(notas);
    
    res.json({
      disciplina: results[0].disciplina,
      professor: results[0].professor,
      estatisticas: stats,
      aprovados: notas.filter(n => n >= 7).length,
      reprovados: notas.filter(n => n < 7).length
    });
  });
});

// ESTATÍSTICAS por aluno
app.get('/estatisticas/aluno/:id', (req, res) => {
  const sql = `
    SELECT a.nome, a.matricula, a.curso, a.semestre,
           m.nota, d.nome as disciplina
    FROM alunos a
    INNER JOIN matricula m ON a.id = m.aluno_id
    INNER JOIN disciplina d ON m.disciplina_id = d.id
    WHERE a.id = ? AND m.nota IS NOT NULL
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    if (results.length === 0) {
      return res.json({ erro: 'Aluno não encontrado ou sem notas' });
    }
    
    const notas = results.map(r => parseFloat(r.nota));
    const stats = calcularEstatisticas(notas);
    
    res.json({
      aluno: {
        nome: results[0].nome,
        matricula: results[0].matricula,
        curso: results[0].curso,
        semestre: results[0].semestre
      },
      estatisticas: stats,
      disciplinas: results.map(r => ({
        disciplina: r.disciplina,
        nota: r.nota
      })),
      situacao: stats.media >= 7 ? 'Aprovado' : 'Reprovado'
    });
  });
});

// COMPARAÇÃO de algoritmos
app.get('/comparar-algoritmos', (req, res) => {
  const sql = `
    SELECT a.id, a.nome, a.matricula, AVG(m.nota) as media_notas
    FROM alunos a
    LEFT JOIN matricula m ON a.id = m.aluno_id
    GROUP BY a.id
    HAVING media_notas IS NOT NULL
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    
    const comparacao = {};
    const detalhes = {};
    
    // QuickSort
    const inicioQuick = performance.now();
    quickSort([...results], 'media_notas');
    comparacao.quickSort = (performance.now() - inicioQuick).toFixed(3);
    detalhes.quickSort = {
      tempo: comparacao.quickSort + 'ms',
      complexidade: 'O(n log n) médio, O(n²) pior',
      espacial: 'O(log n)',
      estavel: 'Não'
    };
    
    // MergeSort
    const inicioMerge = performance.now();
    mergeSort([...results], 'media_notas');
    comparacao.mergeSort = (performance.now() - inicioMerge).toFixed(3);
    detalhes.mergeSort = {
      tempo: comparacao.mergeSort + 'ms',
      complexidade: 'O(n log n) garantido',
      espacial: 'O(n)',
      estavel: 'Sim'
    };
    
    // HeapSort
    const inicioHeap = performance.now();
    heapSort([...results], 'media_notas');
    comparacao.heapSort = (performance.now() - inicioHeap).toFixed(3);
    detalhes.heapSort = {
      tempo: comparacao.heapSort + 'ms',
      complexidade: 'O(n log n) garantido',
      espacial: 'O(1)',
      estavel: 'Não'
    };
    
    // BubbleSort
    const inicioBubble = performance.now();
    bubbleSort([...results], 'media_notas');
    comparacao.bubbleSort = (performance.now() - inicioBubble).toFixed(3);
    detalhes.bubbleSort = {
      tempo: comparacao.bubbleSort + 'ms',
      complexidade: 'O(n²)',
      espacial: 'O(1)',
      estavel: 'Sim'
    };
    
    // Identificar o mais rápido
    const maisRapido = Object.keys(comparacao).reduce((a, b) => 
      parseFloat(comparacao[a]) < parseFloat(comparacao[b]) ? a : b
    );
    
    res.json({
      temposExecucao: comparacao,
      detalhes,
      tamanhoDataset: results.length,
      maisRapido,
      unidade: 'milissegundos',
      observacao: 'Tempos podem variar conforme o hardware e carga do sistema'
    });
  });
});

// DASHBOARD - Resumo geral
app.get('/dashboard', (req, res) => {
  const queries = {
    totalAlunos: 'SELECT COUNT(*) as total FROM alunos',
    totalDisciplinas: 'SELECT COUNT(*) as total FROM disciplina',
    totalMatriculas: 'SELECT COUNT(*) as total FROM matricula',
    mediaGeral: 'SELECT AVG(nota) as media FROM matricula WHERE nota IS NOT NULL',
    aprovados: 'SELECT COUNT(*) as total FROM matricula WHERE nota >= 7.0',
    reprovados: 'SELECT COUNT(*) as total FROM matricula WHERE nota < 7.0'
  };
  
  const results = {};
  let completed = 0;
  
  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (!err) {
        results[key] = result[0].total !== undefined ? result[0].total : result[0].media;
      }
      completed++;
      
      if (completed === Object.keys(queries).length) {
        res.json({
          dashboard: results,
          taxaAprovacao: results.aprovados && results.reprovados ? 
            ((results.aprovados / (results.aprovados + results.reprovados)) * 100).toFixed(2) + '%' : 'N/A'
        });
      }
    });
  });
});

// FILTROS avançados
app.get('/alunos/filtro', (req, res) => {
  const { curso, semestre, notaMinima } = req.query;
  
  let sql = `
    SELECT a.*, AVG(m.nota) as media
    FROM alunos a
    LEFT JOIN matricula m ON a.id = m.aluno_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (curso) {
    sql += ' AND a.curso = ?';
    params.push(curso);
  }
  
  if (semestre) {
    sql += ' AND a.semestre = ?';
    params.push(semestre);
  }
  
  sql += ' GROUP BY a.id';
  
  if (notaMinima) {
    sql += ' HAVING media >= ?';
    params.push(notaMinima);
  }
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// HISTÓRICO do aluno
app.get('/aluno/:id/historico', (req, res) => {
  const sql = `
    SELECT m.*, d.nome as disciplina, d.codigo, m.data_cadastro
    FROM matricula m
    INNER JOIN disciplina d ON m.disciplina_id = d.id
    WHERE m.aluno_id = ?
    ORDER BY m.data_cadastro DESC
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});