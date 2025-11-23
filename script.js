// Frontend script for Controle Financeiro
const API = "https://gustavorenan-sistemafinanceiro-production.up.railway.app";

let allTransacoes = [];
let currentPage = 1;
let pageSize = 10;

function showAlert(msg, type = 'success'){
  const a = document.getElementById('alert');
  a.textContent = msg;
  a.className = `alert ${type} show`;
  setTimeout(()=> a.className = 'alert', 3500);
}

function formatCurrency(v){
  return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function fetchTransacoes(orderBy){
  try{
    const params = new URLSearchParams();
    if(orderBy) params.set('orderBy', orderBy);
    const res = await fetch(`${API}/transacoes?${params.toString()}`);
    if(!res.ok) throw new Error('Erro ao obter transações');
    allTransacoes = await res.json();
    currentPage = 1;
    renderTable();
    updateMetrics();
  }catch(err){
    console.error(err);
    showAlert('Erro ao carregar transações. Verifique o servidor.','error');
  }
}

function getFilters(){
  const search = document.getElementById('search').value.trim().toLowerCase();
  const sortBy = document.getElementById('sortBy').value;
  pageSize = parseInt(document.getElementById('pageSize').value,10);
  return {search, sortBy};
}

function renderTable(){
  const {search} = getFilters();
  let list = [...allTransacoes];
  if(search){ list = list.filter(t => (t.descricao||'').toLowerCase().includes(search)); }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage -1)*pageSize;
  const pageItems = list.slice(start, start + pageSize);

  const tbody = document.querySelector('#transacoesTable tbody');
  tbody.innerHTML = pageItems.map(t => {
    const tipoClass = t.tipo === 'entrada' ? 'pill-entrada' : 'pill-saida';
    const date = t.data ? new Date(t.data).toLocaleDateString() : '';
    return `
      <tr data-id="${t.id}">
        <td>${escapeHtml(t.descricao)}</td>
        <td><span class="pill ${tipoClass}">${escapeHtml(t.tipo)}</span></td>
        <td>${escapeHtml(t.categoria)}</td>
        <td>${formatCurrency(t.valor)}</td>
        <td>${date}</td>
        <td class="actions-btn">
          <button class="btn-edit" onclick="openEdit(${t.id})">Editar</button>
          <button class="btn-delete" onclick="deleteTransacao(${t.id})">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const pg = document.getElementById('pagination');
  let html = '';
  for(let i=1;i<=totalPages;i++){
    html += `<button class="page-btn ${i===currentPage? 'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  pg.innerHTML = html;
}

function goPage(n){ currentPage = n; renderTable(); }

document.getElementById('formTransacao').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const descricao = document.getElementById('descricao').value.trim();
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value) || 0;
  const data = document.getElementById('data').value;
  try{
    const res = await fetch(`${API}/transacoes`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({descricao, valor, tipo, categoria, data})
    });
    if(!res.ok) throw new Error('Erro ao criar');
    await res.json();
    showAlert('Transação criada com sucesso!','success');
    document.getElementById('formTransacao').reset(); setTodayDate();
    const order = document.getElementById('sortBy').value;
    await fetchTransacoes(order);
  }catch(err){console.error(err); showAlert('Erro ao criar transação','error')}
});

document.getElementById('resetForm').addEventListener('click', ()=>{ document.getElementById('formTransacao').reset(); setTodayDate(); });

async function deleteTransacao(id){
  if(!confirm('Deseja realmente excluir essa transação?')) return;
  try{
    const res = await fetch(`${API}/transacoes/${id}`,{method:'DELETE'});
    if(!res.ok) throw new Error('Erro ao deletar');
    showAlert('Transação excluída','success');
    const order = document.getElementById('sortBy').value;
    await fetchTransacoes(order);
  }catch(err){console.error(err); showAlert('Erro ao excluir','error')}
}


async function openEdit(id){
  
  try{
    const res = await fetch(`${API}/transacoes/${id}`);
    if(!res.ok) throw new Error('Não encontrado');
    const item = await res.json();
    document.getElementById('editId').value = item.id;
    document.getElementById('editDescricao').value = item.descricao || '';
    document.getElementById('editTipo').value = item.tipo || 'entrada';
    document.getElementById('editCategoria').value = item.categoria || 'outros';
    document.getElementById('editValor').value = item.valor || 0;
    document.getElementById('editData').value = item.data ? item.data.split('T')[0] : '';
    document.getElementById('modal').classList.remove('hidden');
  }catch(err){
    console.error(err);
    showAlert('Erro ao abrir edição','error');
  }
}

document.getElementById('closeModal').addEventListener('click', ()=>{ document.getElementById('modal').classList.add('hidden'); });

document.getElementById('formEdit').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const descricao = document.getElementById('editDescricao').value.trim();
  const tipo = document.getElementById('editTipo').value;
  const categoria = document.getElementById('editCategoria').value;
  const valor = parseFloat(document.getElementById('editValor').value) || 0;
  const data = document.getElementById('editData').value;
  try{
    const res = await fetch(`${API}/transacoes/${id}`,{
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({descricao, valor, tipo, categoria, data})
    });
    if(!res.ok) throw new Error('Erro ao editar');
    await res.json();
    showAlert('Transação atualizada','success');
    document.getElementById('modal').classList.add('hidden');
    const order = document.getElementById('sortBy').value;
    await fetchTransacoes(order);
  }catch(err){console.error(err); showAlert('Erro ao atualizar','error')}
});

let _searchDebounceTimer = null;
async function performServerSearch(q){
  if(!q) return fetchTransacoes(document.getElementById('sortBy').value);
  try{
    const res = await fetch(`${API}/transacoes/busca/${encodeURIComponent(q)}`);
    if(!res.ok) throw new Error('Busca falhou');
    const json = await res.json();
    const data = json.data;
    const results = Array.isArray(data) ? data : (data ? [data] : []);
    allTransacoes = results;
    currentPage = 1;
    renderTable();
    updateMetrics();
    showAlert(`Busca concluída (${json.tempoExecucao || '—'})`,'success');
  }catch(err){
    console.error(err);
    showAlert('Busca por servidor falhou — usando filtro local','error');
    
    currentPage = 1;
    renderTable();
  }
}


document.getElementById('search').addEventListener('input', (e)=>{
  const q = e.target.value.trim();
  currentPage = 1;
  clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(()=> performServerSearch(q), 350);
});


document.getElementById('search').addEventListener('keydown', async (e)=>{
  if(e.key === 'Enter'){
    e.preventDefault();
    clearTimeout(_searchDebounceTimer);
    const q = document.getElementById('search').value.trim();
    await performServerSearch(q);
  }
});


// --- Dashboard ---
function updateMetrics(){
  // Calculo medio
  let entradas = 0;
  let saidas = 0;
  const catMap = new Map();

  for(const t of allTransacoes){
    const v = Number(t.valor) || 0;
    if(t.tipo === 'entrada') entradas += v;
    else if(t.tipo === 'saida'){
      saidas += v;
      const key = t.categoria || 'Outros';
      catMap.set(key, (catMap.get(key) || 0) + v);
    }
  }

  const elEntr = document.getElementById('bal-entradas');
  const elSaid = document.getElementById('bal-saidas');
  const elSaldo = document.getElementById('bal-saldo');
  if(elEntr) elEntr.textContent = formatCurrency(entradas);
  if(elSaid) elSaid.textContent = formatCurrency(saidas);
  if(elSaldo) elSaldo.textContent = formatCurrency(entradas - saidas);


  const catEl = document.getElementById('categoryList');
  if(!catEl) return;

  const cats = Array.from(catMap.entries()).sort((a,b)=> b[1]-a[1]);
  const totalDespesas = saidas || 0;
  if(cats.length === 0){
    catEl.innerHTML = `<div class="category-item"><div class="cat-info"><strong>Sem despesas</strong><span>R$ 0,00</span></div><div class="cat-bar"><div class="bar-fill" style="width:2%"></div></div></div>`;
    return;
  }

  catEl.innerHTML = cats.map(([catName, val])=>{
    const percent = totalDespesas > 0 ? (val / totalDespesas) * 100 : 0;
    const width = Math.max(3, Math.round(percent));
    return `
      <div class="category-item">
        <div class="cat-info"><strong>${escapeHtml(catName)}</strong><span>${formatCurrency(val)}</span></div>
        <div class="cat-bar"><div class="bar-fill" style="width:${width}%"></div></div>
      </div>
    `;
  }).join('');
}

document.getElementById('sortBy').addEventListener('change', async (e)=>{ currentPage=1; await fetchTransacoes(e.target.value); });
document.getElementById('pageSize').addEventListener('change', ()=>{ currentPage=1; renderTable(); });

function setTodayDate(){ const hoje = new Date().toISOString().split('T')[0]; document.getElementById('data').value = hoje; }


document.getElementById('themeToggle').addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
  document.getElementById('themeToggle').textContent = document.body.classList.contains('dark-mode')? '☀️':'🌙';
});

window.addEventListener('load', async ()=>{
  setTodayDate();
  const initialOrder = document.getElementById('sortBy').value;
  await fetchTransacoes(initialOrder);
});


window.openEdit = openEdit;
window.deleteTransacao = deleteTransacao;
window.goPage = goPage;
