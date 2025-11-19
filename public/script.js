// Configuraçao
const API = 'http://localhost:3000';
let dashChart, notasChart, compChart;


function showAlert(msg, type) {
    const alert = document.getElementById('alert');
    alert.textContent = msg;
    alert.className = `alert ${type} show`;
    setTimeout(() => alert.classList.remove('show'), 3000);
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');

    // Carregar dados específicos da tab
    if (tab === 'dashboard') carregarDashboard();
    if (tab === 'crud') {
        carregarAlunos();
        carregarSelectAlunos();
        carregarSelectDisciplinas();
    }
    if (tab === 'ranking') carregarRanking('quicksort');
    if (tab === 'estatisticas') carregarEstatisticas();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// DASHBOARD

async function carregarDashboard() {
    try {
        const res = await fetch(`${API}/dashboard`);
        const data = await res.json();
        
        document.getElementById('totalAlunos').textContent = data.dashboard.totalAlunos || 0;
        document.getElementById('totalDisciplinas').textContent = data.dashboard.totalDisciplinas || 0;
        document.getElementById('totalMatriculas').textContent = data.dashboard.totalMatriculas || 0;
        document.getElementById('mediaGeral').textContent = data.dashboard.mediaGeral ? 
            data.dashboard.mediaGeral.toFixed(2) : 'N/A';
        document.getElementById('aprovados').textContent = data.dashboard.aprovados || 0;
        document.getElementById('taxaAprovacao').textContent = data.taxaAprovacao || 'N/A';

        // Criar gráfico do dashboard
        if (dashChart) dashChart.destroy();
        
        const ctx = document.getElementById('dashboardChart').getContext('2d');
        dashChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovados', 'Reprovados'],
                datasets: [{
                    data: [data.dashboard.aprovados, data.dashboard.reprovados],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Aprovações'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showAlert('Erro ao carregar dashboard. Verifique se o servidor está rodando!', 'error');
    }
}

// CRUD ALUNOS 

document.getElementById('formAluno').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const aluno = {
        nome: document.getElementById('nomeAluno').value,
        idade: document.getElementById('idadeAluno').value,
        matricula: document.getElementById('matriculaAluno').value,
        curso: document.getElementById('cursoAluno').value,
        data_cadastro: document.getElementById('dataCadastroAluno').value,
        semestre: document.getElementById('semestreAluno').value
    };

    try {
        const res = await fetch(`${API}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aluno)
        });

        if (res.ok) {
            showAlert('✅ Aluno cadastrado com sucesso!', 'success');
            e.target.reset();
            carregarAlunos();
            carregarSelectAlunos();
        } else {
            const error = await res.json();
            showAlert(`❌ Erro: ${error.erro}`, 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Erro ao cadastrar aluno. Verifique o servidor!', 'error');
    }
});

async function carregarAlunos() {
    try {
        const res = await fetch(`${API}/alunos`);
        const alunos = await res.json();
        
        const tbody = document.querySelector('#tabelaAlunos tbody');
        tbody.innerHTML = alunos.map(a => `
            <tr>
                <td>${a.id}</td>
                <td><strong>${a.nome}</strong></td>
                <td>${a.matricula}</td>
                <td>${a.curso}</td>
                <td>${a.semestre}º</td>
                <td>
                    <button class="btn-small btn-danger" onclick="deletarAluno(${a.id})">
                        🗑️ Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
    }
}

async function deletarAluno(id) {
    if (!confirm('⚠️ Deseja realmente excluir este aluno?')) return;
    
    try {
        const res = await fetch(`${API}/alunos/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showAlert('✅ Aluno excluído com sucesso!', 'success');
            carregarAlunos();
        } else {
            showAlert('❌ Erro ao excluir aluno', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Erro ao excluir aluno', 'error');
    }
}

// CRUD DISCIPLINAS 

document.getElementById('formDisciplina').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const disciplina = {
        nome: document.getElementById('nomeDisciplina').value,
        curso: document.getElementById('cursoDisciplina').value,
        codigo: document.getElementById('codigoDisciplina').value,
        professor: document.getElementById('professorDisciplina').value,
        carga_horaria: document.getElementById('cargaDisciplina').value
    };

    try {
        const res = await fetch(`${API}/disciplinas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(disciplina)
        });

        if (res.ok) {
            showAlert('✅ Disciplina cadastrada com sucesso!', 'success');
            e.target.reset();
            carregarSelectDisciplinas();
        } else {
            showAlert('❌ Erro ao cadastrar disciplina', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Erro ao cadastrar disciplina', 'error');
    }
});

async function carregarSelectAlunos() {
    try {
        const res = await fetch(`${API}/alunos`);
        const alunos = await res.json();
        
        const select = document.getElementById('alunoMatricula');
        select.innerHTML = '<option value="">Selecione um aluno</option>' +
            alunos.map(a => `<option value="${a.id}">${a.nome} (${a.matricula})</option>`).join('');
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
    }
}

async function carregarSelectDisciplinas() {
    try {
        const res = await fetch(`${API}/disciplinas`);
        const disciplinas = await res.json();
        
        const select = document.getElementById('disciplinaMatricula');
        select.innerHTML = '<option value="">Selecione uma disciplina</option>' +
            disciplinas.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
    }
}

//CRUD MATRÍCULAS

document.getElementById('formMatricula').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matricula = {
        aluno_id: document.getElementById('alunoMatricula').value,
        disciplina_id: document.getElementById('disciplinaMatricula').value,
        peso: document.getElementById('pesoMatricula').value,
        nota: document.getElementById('notaMatricula').value,
        data_cadastro: document.getElementById('dataMatricula').value
    };

    try {
        const res = await fetch(`${API}/matriculas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matricula)
        });

        if (res.ok) {
            showAlert('✅ Matrícula realizada com sucesso!', 'success');
            e.target.reset();
        } else {
            showAlert('❌ Erro ao realizar matrícula', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Erro ao realizar matrícula', 'error');
    }
});

// RANKING

async function carregarRanking(algoritmo) {
    // Mostrar loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('podium').style.display = 'none';
    document.getElementById('rankingTable').style.display = 'none';
    document.getElementById('infoBox').style.display = 'none';

    try {
        const res = await fetch(`${API}/ranking/${algoritmo}`);
        const data = await res.json();

        // Atualizar info box
        document.getElementById('infoBox').innerHTML = `
            <div class="info-stat">
                <strong>${data.algoritmo}</strong>
                <span>Algoritmo</span>
            </div>
            <div class="info-stat">
                <strong>${data.tempoExecucao}</strong>
                <span>Tempo de Execução</span>
            </div>
            <div class="info-stat">
                <strong>${data.totalAlunos}</strong>
                <span>Total de Alunos</span>
            </div>
        `;
        document.getElementById('infoBox').style.display = 'grid';

        // Esconder loading
        document.getElementById('loading').style.display = 'none';

        if (data.ranking.length >= 3) {
            // Atualizar pódio
            atualizarPodio(data.ranking);
            document.getElementById('podium').style.display = 'flex';
        }

        // Atualizar tabela
        atualizarTabelaRanking(data.ranking);
        document.getElementById('rankingTable').style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        document.getElementById('loading').innerHTML = '<p style="color: #e74c3c;">❌ Erro ao carregar ranking. Verifique se o servidor está rodando!</p>';
    }
}

function atualizarPodio(ranking) {
    // 1º Lugar
    if (ranking[0]) {
        document.getElementById('first-name').textContent = ranking[0].nome;
        document.getElementById('first-score').textContent = ranking[0].media_notas ? 
            ranking[0].media_notas.toFixed(2) : 'N/A';
        document.getElementById('first-mat').textContent = ranking[0].matricula;
        document.getElementById('first-disc').textContent = ranking[0].total_disciplinas;
    }

    // 2º Lugar
    if (ranking[1]) {
        document.getElementById('second-name').textContent = ranking[1].nome;
        document.getElementById('second-score').textContent = ranking[1].media_notas ? 
            ranking[1].media_notas.toFixed(2) : 'N/A';
        document.getElementById('second-mat').textContent = ranking[1].matricula;
        document.getElementById('second-disc').textContent = ranking[1].total_disciplinas;
    }

    // 3º Lugar
    if (ranking[2]) {
        document.getElementById('third-name').textContent = ranking[2].nome;
        document.getElementById('third-score').textContent = ranking[2].media_notas ? 
            ranking[2].media_notas.toFixed(2) : 'N/A';
        document.getElementById('third-mat').textContent = ranking[2].matricula;
        document.getElementById('third-disc').textContent = ranking[2].total_disciplinas;
    }
}

function atualizarTabelaRanking(ranking) {
    const tbody = document.querySelector('#tabelaRanking tbody');
    tbody.innerHTML = ranking.map((aluno, index) => {
        const rankClass = index === 0 ? 'rank-1' : 
                         index === 1 ? 'rank-2' : 
                         index === 2 ? 'rank-3' : 'rank-other';
        const nota = aluno.media_notas ? parseFloat(aluno.media_notas) : 0;
        const progresso = (nota / 10) * 100;

        return `
            <tr>
                <td>
                    <span class="rank-number ${rankClass}">${index + 1}</span>
                </td>
                <td><strong>${aluno.nome}</strong></td>
                <td>${aluno.matricula}</td>
                <td><strong>${nota.toFixed(2)}</strong></td>
                <td>${aluno.total_disciplinas}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progresso}%"></div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// BUSCA 

async function realizarBusca() {
    const tipo = document.getElementById('tipoBusca').value;
    const valor = document.getElementById('valorBusca').value;
    
    if (!valor) {
        showAlert('⚠️ Digite um valor para buscar', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/busca/${tipo}/${encodeURIComponent(valor)}`);
        const data = await res.json();
        
        const resultDiv = document.getElementById('resultadoBusca');
        resultDiv.style.display = 'block';
        
        if (Array.isArray(data.resultado)) {
            resultDiv.innerHTML = `
                <h3>🔍 Resultados da Busca</h3>
                <p><strong>Tipo:</strong> ${data.tipo} <span class="complexity-badge">${data.complexidade}</span></p>
                <p><strong>Tempo de Execução:</strong> ${data.tempoExecucao}</p>
                <p><strong>Comparações Realizadas:</strong> ${data.comparacoes}</p>
                <p><strong>Total de Registros:</strong> ${data.totalRegistros}</p>
                <hr style="margin: 15px 0;">
                <p><strong>Encontrados:</strong> ${data.resultado.length} aluno(s)</p>
                <ul style="list-style: none; padding: 0;">
                    ${data.resultado.map(a => `
                        <li style="padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px;">
                            <strong>${a.nome}</strong> - Matrícula: ${a.matricula} - Curso: ${a.curso}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (data.resultado) {
            resultDiv.innerHTML = `
                <h3>✅ Aluno Encontrado</h3>
                <p><strong>Tipo de Busca:</strong> ${data.tipo} <span class="complexity-badge">${data.complexidade}</span></p>
                <p><strong>Tempo de Execução:</strong> ${data.tempoExecucao}</p>
                <p><strong>Comparações Realizadas:</strong> ${data.comparacoes}</p>
                <hr style="margin: 15px 0;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <p><strong>Nome:</strong> ${data.resultado.nome}</p>
                    <p><strong>Matrícula:</strong> ${data.resultado.matricula}</p>
                    <p><strong>Idade:</strong> ${data.resultado.idade}</p>
                    <p><strong>Curso:</strong> ${data.resultado.curso}</p>
                    <p><strong>Semestre:</strong> ${data.resultado.semestre}º</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <h3>❌ Nenhum Resultado</h3>
                <p><strong>Tipo de Busca:</strong> ${data.tipo}</p>
                <p><strong>Tempo:</strong> ${data.tempoExecucao}</p>
                <p>Nenhum aluno encontrado com os critérios informados.</p>
            `;
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Erro ao realizar busca', 'error');
    }
}

// ESTATÍSTICAS 

async function carregarEstatisticas() {
    try {
        const res = await fetch(`${API}/estatisticas`);
        const data = await res.json();
        
        const stats = data.estatisticas;
        
        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card">
                <div class="icon">📊</div>
                <div class="stat-value">${stats.media.toFixed(2)}</div>
                <div class="stat-label">Média Geral</div>
                <small style="opacity: 0.8;">Complexidade: O(n)</small>
            </div>
            <div class="stat-card">
                <div class="icon">📈</div>
                <div class="stat-value">${stats.mediana.toFixed(2)}</div>
                <div class="stat-label">Mediana</div>
                <small style="opacity: 0.8;">Complexidade: O(n log n)</small>
            </div>
            <div class="stat-card">
                <div class="icon">🔝</div>
                <div class="stat-value">${stats.maximo.toFixed(2)}</div>
                <div class="stat-label">Nota Máxima</div>
                <small style="opacity: 0.8;">Complexidade: O(n)</small>
            </div>
            <div class="stat-card">
                <div class="icon">📉</div>
                <div class="stat-value">${stats.minimo.toFixed(2)}</div>
                <div class="stat-label">Nota Mínima</div>
                <small style="opacity: 0.8;">Complexidade: O(n)</small>
            </div>
            <div class="stat-card">
                <div class="icon">📏</div>
                <div class="stat-value">${stats.desvioPadrao.toFixed(2)}</div>
                <div class="stat-label">Desvio Padrão</div>
                <small style="opacity: 0.8;">Complexidade: O(n)</small>
            </div>
            <div class="stat-card">
                <div class="icon">🎯</div>
                <div class="stat-value">${stats.moda.toFixed(2)}</div>
                <div class="stat-label">Moda</div>
                <small style="opacity: 0.8;">Complexidade: O(n)</small>
            </div>
        `;

        // Gráfico de distribuição
        if (notasChart) notasChart.destroy();
        
        const ctx = document.getElementById('graficoNotas').getContext('2d');
        notasChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0-4', '4-7', '7-9', '9-10'],
                datasets: [{
                    label: 'Distribuição de Notas',
                    data: [
                        data.distribuicao['0-4'],
                        data.distribuicao['4-7'],
                        data.distribuicao['7-9'],
                        data.distribuicao['9-10']
                    ],
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#3498db',
                        '#27ae60'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Distribuição de Notas - ${data.totalNotas} notas analisadas`
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        showAlert('❌ Erro ao carregar estatísticas', 'error');
    }
}

// COMPARAÇÃO DE ALGORITMOS 

async function compararAlgoritmos() {
    document.getElementById('resultadoComparacao').innerHTML = '<div class="loading"><div class="spinner"></div><p>⏳ Executando comparação...</p></div>';
    
    try {
        const res = await fetch(`${API}/comparar-algoritmos`);
        const data = await res.json();
        
        document.getElementById('resultadoComparacao').innerHTML = `
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-top: 20px;">
                <h3>📊 Resultados da Comparação</h3>
                <p><strong>Tamanho do Dataset:</strong> ${data.tamanhoDataset} alunos</p>
                <p><strong>Mais Rápido:</strong> 🏆 ${data.maisRapido.toUpperCase()}</p>
                <hr style="margin: 15px 0;">
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 10px; margin: 5px 0;">
                        <strong>QuickSort:</strong> ${data.temposExecucao.quickSort}ms 
                        <small>(O(n log n) médio)</small>
                    </li>
                    <li style="padding: 10px; margin: 5px 0;">
                        <strong>MergeSort:</strong> ${data.temposExecucao.mergeSort}ms 
                        <small>(O(n log n) garantido)</small>
                    </li>
                    <li style="padding: 10px; margin: 5px 0;">
                        <strong>HeapSort:</strong> ${data.temposExecucao.heapSort}ms 
                        <small>(O(n log n) in-place)</small>
                    </li>
                    <li style="padding: 10px; margin: 5px 0;">
                        <strong>BubbleSort:</strong> ${data.temposExecucao.bubbleSort}ms 
                        <small>(O(n²))</small>
                    </li>
                </ul>
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    ⚠️ ${data.observacao}
                </p>
            </div>
        `;

        // Criar gráfico de comparação
        if (compChart) compChart.destroy();
        
        const ctx = document.getElementById('graficoComparacao').getContext('2d');
        compChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['QuickSort', 'MergeSort', 'HeapSort', 'BubbleSort'],
                datasets: [{
                    label: 'Tempo de Execução (ms)',
                    data: [
                        parseFloat(data.temposExecucao.quickSort),
                        parseFloat(data.temposExecucao.mergeSort),
                        parseFloat(data.temposExecucao.heapSort),
                        parseFloat(data.temposExecucao.bubbleSort)
                    ],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#27ae60',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparação de Performance dos Algoritmos'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao comparar algoritmos:', error);
        showAlert('❌ Erro ao comparar algoritmos', 'error');
    }
}

// INICIALIZAÇÃO 

window.addEventListener('load', () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Carregar dashboard inicial
    carregarDashboard();

    // Definir data atual nos campos de data
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataCadastroAluno').value = hoje;
    document.getElementById('dataMatricula').value = hoje;

    console.log('🎓 Sistema Acadêmico Avançado carregado!');
    console.log('📊 Algoritmos implementados: QuickSort, MergeSort, HeapSort, BubbleSort');
    console.log('🔍 Buscas disponíveis: Binária, Linear, Hash Table');
});