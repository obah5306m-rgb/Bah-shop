const STORAGE_KEY = 'bah-business-v1';

const seed = {
  products: [
    { id: 1, name: 'Riz 25 kg', category: 'Alimentation', price: 35000, cost: 27000, stock: 24, minStock: 5 },
    { id: 2, name: 'Huile 1 L', category: 'Alimentation', price: 1500, cost: 1100, stock: 6, minStock: 10 },
    { id: 3, name: 'Sucre 1 kg', category: 'Alimentation', price: 900, cost: 700, stock: 8, minStock: 10 },
    { id: 4, name: 'Lait en poudre', category: 'Alimentation', price: 4500, cost: 3500, stock: 32, minStock: 8 }
  ],
  clients: [
    { id: 1, name: 'Mamadou Traoré', phone: '+223 70 00 00 01', credit: 0 },
    { id: 2, name: 'Aïssata Coulibaly', phone: '+223 70 00 00 02', credit: 0 },
    { id: 3, name: 'Amadou Diallo', phone: '+223 70 00 00 03', credit: 31000 }
  ],
  sales: [
    { id: 1, clientId: 1, productId: 1, qty: 1, amount: 35000, cost: 27000, status: 'Payé', date: '2026-09-10' },
    { id: 2, clientId: 2, productId: 2, qty: 19, amount: 28500, cost: 20900, status: 'Payé', date: '2026-09-09' },
    { id: 3, clientId: 3, productId: 3, qty: 34, amount: 30600, cost: 23800, status: 'Crédit', date: '2026-09-08' }
  ],
  expenses: [
    { id: 1, label: 'Transport marchandises', amount: 25000, date: '2026-09-09' },
    { id: 2, label: 'Électricité', amount: 15000, date: '2026-09-05' }
  ]
};

let db = load();
let currentView = 'dashboard';

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seed);
  } catch (_) { return structuredClone(seed); }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function money(value) { return new Intl.NumberFormat('fr-FR').format(Math.round(value || 0)) + ' FCFA'; }
function nextId(items) { return items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1; }
function product(id) { return db.products.find(x => Number(x.id) === Number(id)); }
function client(id) { return db.clients.find(x => Number(x.id) === Number(id)); }
function totals() {
  const revenue = db.sales.reduce((s, x) => s + Number(x.amount), 0);
  const gross = db.sales.reduce((s, x) => s + Number(x.amount) - Number(x.cost), 0);
  const expenses = db.expenses.reduce((s, x) => s + Number(x.amount), 0);
  return { revenue, gross, expenses, profit: gross - expenses };
}
function lowStock() { return db.products.filter(x => Number(x.stock) <= Number(x.minStock)); }

function layout() {
  document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.view); }));
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', () => action(el.dataset.action)));
  renderDashboard();
}

function showView(view) {
  currentView = view;
  document.querySelectorAll('[data-view]').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  const title = { dashboard: 'Tableau de bord', products: 'Produits & Stock', sales: 'Ventes', clients: 'Clients', expenses: 'Dépenses', reports: 'Rapports', settings: 'Paramètres' }[view] || 'Tableau de bord';
  document.querySelector('h1').textContent = title;
  document.querySelector('#app-content').innerHTML = views[view]();
  bindDynamic();
}

function renderDashboard() {
  const t = totals();
  document.querySelector('#stat-revenue').textContent = money(t.revenue);
  document.querySelector('#stat-profit').textContent = money(t.profit);
  document.querySelector('#stat-sales').textContent = db.sales.length;
  document.querySelector('#stat-low').textContent = lowStock().length + ' produits';
  document.querySelector('#recent-sales').innerHTML = db.sales.slice().reverse().slice(0, 6).map(s => rowSale(s)).join('') || '<tr><td colspan="4">Aucune vente.</td></tr>';
  document.querySelector('#low-stock').innerHTML = lowStock().map(p => `<div><b>${esc(p.name)}</b><span>${p.stock} restant(s)</span></div>`).join('') || '<div><b>Tout va bien</b><span>Aucun stock faible</span></div>';
}
function rowSale(s) { const c = client(s.clientId); const p = product(s.productId); return `<tr><td>${esc(c?.name || 'Client supprimé')}</td><td>${esc(p?.name || 'Produit supprimé')}</td><td>${money(s.amount)}</td><td><span class="badge ${s.status === 'Payé' ? 'ok' : 'pending'}">${s.status}</span></td></tr>`; }

const views = {
  dashboard: () => `
    <section class="cards"><article><p>Chiffre d'affaires</p><strong id="stat-revenue">0 FCFA</strong><small>Ventes enregistrées</small></article><article><p>Bénéfice net estimé</p><strong id="stat-profit">0 FCFA</strong><small>Après dépenses</small></article><article><p>Ventes</p><strong id="stat-sales">0</strong><small>Total enregistré</small></article><article><p>Stock faible</p><strong id="stat-low">0 produits</strong><small>À réapprovisionner</small></article></section>
    <section class="grid"><article class="panel large"><div class="panel-head"><h2>Ventes récentes</h2><a href="#sales" data-view="sales">Voir tout</a></div><div class="table-wrap"><table><thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Statut</th></tr></thead><tbody id="recent-sales"></tbody></table></div></article><article class="panel"><h2>Stock faible</h2><div class="stock" id="low-stock"></div></article></section>
    <section class="panel quick"><h2>Actions rapides</h2><div><button data-action="product">＋ Ajouter un produit</button><button data-action="sale">＋ Enregistrer une vente</button><button data-action="expense">＋ Ajouter une dépense</button><button data-action="client">＋ Nouveau client</button></div></section>`,
  products: () => `<section class="panel"><div class="panel-head"><h2>Catalogue (${db.products.length})</h2><button class="primary" data-action="product">+ Ajouter un produit</button></div><input class="search" id="product-search" placeholder="Rechercher un produit..."><div class="table-wrap"><table><thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Seuil</th><th>Action</th></tr></thead><tbody id="products-body">${productRows(db.products)}</tbody></table></div></section>`,
  sales: () => `<section class="panel"><div class="panel-head"><h2>Historique des ventes (${db.sales.length})</h2><button class="primary" data-action="sale">+ Nouvelle vente</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>Produit</th><th>Qté</th><th>Montant</th><th>Statut</th></tr></thead><tbody>${db.sales.slice().reverse().map(s => { const c=client(s.clientId),p=product(s.productId); return `<tr><td>${s.date}</td><td>${esc(c?.name||'—')}</td><td>${esc(p?.name||'—')}</td><td>${s.qty}</td><td>${money(s.amount)}</td><td><span class="badge ${s.status==='Payé'?'ok':'pending'}">${s.status}</span></td></tr>`; }).join('') || '<tr><td colspan="6">Aucune vente.</td></tr>'}</tbody></table></div></section>`,
  clients: () => `<section class="panel"><div class="panel-head"><h2>Clients (${db.clients.length})</h2><button class="primary" data-action="client">+ Nouveau client</button></div><div class="table-wrap"><table><thead><tr><th>Nom</th><th>Téléphone</th><th>Crédit</th></tr></thead><tbody>${db.clients.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.phone||'—')}</td><td>${money(c.credit)}</td></tr>`).join('') || '<tr><td colspan="3">Aucun client.</td></tr>'}</tbody></table></div></section>`,
  expenses: () => { const total=db.expenses.reduce((s,e)=>s+Number(e.amount),0); return `<section class="panel"><div class="panel-head"><h2>Dépenses — ${money(total)}</h2><button class="primary" data-action="expense">+ Ajouter</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Libellé</th><th>Montant</th></tr></thead><tbody>${db.expenses.slice().reverse().map(e=>`<tr><td>${e.date}</td><td>${esc(e.label)}</td><td>${money(e.amount)}</td></tr>`).join('')||'<tr><td colspan="3">Aucune dépense.</td></tr>'}</tbody></table></div></section>`; },
  reports: () => { const t=totals(); return `<section class="cards"><article><p>Chiffre d'affaires</p><strong>${money(t.revenue)}</strong></article><article><p>Marge brute</p><strong>${money(t.gross)}</strong></article><article><p>Dépenses</p><strong>${money(t.expenses)}</strong></article><article><p>Bénéfice net</p><strong>${money(t.profit)}</strong></article></section><section class="panel"><h2>Résumé</h2><p class="report-text">Les chiffres sont calculés automatiquement à partir des ventes et dépenses enregistrées dans cette version locale.</p></section>`; },
  settings: () => `<section class="panel settings"><h2>Paramètres</h2><label>Nom de l'entreprise<input id="business-name" value="BAH BUSINESS"></label><label>Devise<input value="FCFA" disabled></label><button class="primary" data-action="reset">Réinitialiser les données de démonstration</button></section>`
};

function productRows(items) { return items.map(p => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td><span class="stock-number ${p.stock<=p.minStock?'danger':''}">${p.stock}</span></td><td>${p.minStock}</td><td><button class="link-btn" data-edit-product="${p.id}">Modifier</button></td></tr>`).join('') || '<tr><td colspan="6">Aucun produit.</td></tr>'; }

function bindDynamic() {
  document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.view); }));
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', () => action(el.dataset.action)));
  document.querySelectorAll('[data-edit-product]').forEach(el => el.addEventListener('click', () => productModal(Number(el.dataset.editProduct))));
  const search = document.querySelector('#product-search');
  if (search) search.addEventListener('input', () => { const q=search.value.toLowerCase(); document.querySelector('#products-body').innerHTML=productRows(db.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))); bindDynamic(); });
}

function action(type) { if(type==='product') productModal(); if(type==='sale') saleModal(); if(type==='client') clientModal(); if(type==='expense') expenseModal(); if(type==='reset' && confirm('Réinitialiser toutes les données de démonstration ?')) { db=structuredClone(seed); save(); showView('dashboard'); } }
function modal(title, body, onSubmit) { const wrap=document.createElement('div'); wrap.className='modal-backdrop'; wrap.innerHTML=`<div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close">×</button></div><form>${body}<div class="modal-actions"><button type="button" class="secondary close">Annuler</button><button class="primary" type="submit">Enregistrer</button></div></form></div>`; document.body.appendChild(wrap); wrap.querySelectorAll('.close').forEach(b=>b.onclick=()=>wrap.remove()); wrap.querySelector('form').onsubmit=e=>{e.preventDefault(); onSubmit(new FormData(e.target)); wrap.remove(); save(); showView(currentView); }; }
function productModal(id) { const p=id?product(id):null; modal(p?'Modifier le produit':'Ajouter un produit', `<label>Nom<input name="name" required value="${esc(p?.name||'')}"></label><label>Catégorie<input name="category" value="${esc(p?.category||'Alimentation')}"></label><div class="form-grid"><label>Prix de vente<input name="price" type="number" min="0" required value="${p?.price||''}"></label><label>Prix d'achat<input name="cost" type="number" min="0" required value="${p?.cost||''}"></label></div><div class="form-grid"><label>Stock<input name="stock" type="number" min="0" required value="${p?.stock||0}"></label><label>Seuil minimum<input name="minStock" type="number" min="0" required value="${p?.minStock||5}"></label></div>`, f=>{const data={name:f.get('name').trim(),category:f.get('category').trim(),price:Number(f.get('price')),cost:Number(f.get('cost')),stock:Number(f.get('stock')),minStock:Number(f.get('minStock'))}; if(p) Object.assign(p,data); else db.products.push({id:nextId(db.products),...data}); }); }
function clientModal() { modal('Nouveau client', `<label>Nom complet<input name="name" required></label><label>Téléphone<input name="phone"></label>`, f=>db.clients.push({id:nextId(db.clients),name:f.get('name').trim(),phone:f.get('phone').trim(),credit:0})); }
function expenseModal() { modal('Nouvelle dépense', `<label>Libellé<input name="label" required placeholder="Ex: Transport"></label><label>Montant (FCFA)<input name="amount" type="number" min="1" required></label><label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label>`, f=>db.expenses.push({id:nextId(db.expenses),label:f.get('label').trim(),amount:Number(f.get('amount')),date:f.get('date')})); }
function saleModal() { const optsP=db.products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)} — stock ${p.stock}</option>`).join(''); const optsC=db.clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(''); modal('Enregistrer une vente', `<label>Produit<select name="productId" required>${optsP}</select></label><label>Client<select name="clientId" required>${optsC}</select></label><div class="form-grid"><label>Quantité<input name="qty" type="number" min="1" value="1" required></label><label>Paiement<select name="status"><option>Payé</option><option>Crédit</option></select></label></div>`, f=>{const p=product(f.get('productId')),c=client(f.get('clientId')),qty=Number(f.get('qty')); if(!p||!c||qty>p.stock){alert('Stock insuffisant ou données invalides.');return;} const amount=p.price*qty,cost=p.cost*qty; p.stock-=qty; if(f.get('status')==='Crédit') c.credit+=amount; db.sales.push({id:nextId(db.sales),clientId:c.id,productId:p.id,qty,amount,cost,status:f.get('status'),date:new Date().toISOString().slice(0,10)}); }); }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

document.addEventListener('DOMContentLoaded', () => { layout(); });
