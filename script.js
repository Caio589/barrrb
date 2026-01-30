// ===== DB =====
let db = JSON.parse(localStorage.getItem("db")) || {};
db.clientes = db.clientes || [];
db.planos   = db.planos || [];
db.produtos = db.produtos || [];
db.vendas   = db.vendas || [];
db.despesas = db.despesas || [];
db.caixa    = db.caixa || {aberto:false,data:null,abertura:0};

let carrinho=[];
let grafico=null;

function save(){localStorage.setItem("db",JSON.stringify(db));}

// ===== UI =====
function show(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  render();
}

function render(){
  cliente.innerHTML = db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  planoCliente.innerHTML = `<option value="">Sem plano</option>` + db.planos.map(p=>`<option>${p.nome}</option>`).join("");
  produto.innerHTML = db.produtos.map(p=>`<option>${p.nome}|${p.valor}|${p.tipo}</option>`).join("");

  listaClientes.innerHTML = db.clientes.map(c=>`
    <li>${c.nome} | Plano: ${c.plano||"Nenhum"} | Saldo: ${c.saldo||0}
    <button onclick="renovarPlano('${c.nome}')">🔄 Renovar</button></li>
  `).join("");

  listaPlanos.innerHTML = db.planos.map(p=>`<li>${p.nome} R$ ${p.valor}</li>`).join("");
  listaEstoque.innerHTML = db.produtos.map(p=>`<li>${p.nome} R$ ${p.valor}</li>`).join("");
  listaDespesas.innerHTML = db.despesas.map(d=>`<li>${d.data} ${d.desc} R$ ${d.valor}</li>`).join("");

  renderCaixa();
  carrinhoRender();
  graficoRender();
}

// ===== CAIXA =====
function abrirCaixa(){
  db.caixa={aberto:true,data:new Date().toISOString().slice(0,10),abertura:+valorAbertura.value||0};
  save(); renderCaixa();
}

function fecharCaixa(){
  const hoje=db.caixa.data;
  let dinheiro=0,pix=0,cartao=0;

  db.vendas.filter(v=>v.data.startsWith(hoje)).forEach(v=>{
    if(v.pagamento==="dinheiro")dinheiro+=v.total;
    if(v.pagamento==="pix")pix+=v.total;
    if(v.pagamento==="cartao")cartao+=v.total;
  });

  const despesas=db.despesas.filter(d=>d.data===hoje).reduce((s,d)=>s+d.valor,0);
  const lucro=(dinheiro+pix+cartao)-despesas;

  alert(`Dinheiro ${dinheiro}\nPix ${pix}\nCartão ${cartao}\nLucro ${lucro}`);

  db.caixa={aberto:false,data:null,abertura:0};
  save(); renderCaixa();
}

function renderCaixa(){
  caixaFechado.style.display=db.caixa.aberto?"none":"block";
  caixaAberto.style.display=db.caixa.aberto?"block":"none";
  valorAberturaInfo.innerText=db.caixa.abertura;
}

// ===== PDV =====
function carrinhoRender(){
  let html="<tr><th>Item</th><th>Valor</th></tr>",soma=0;
  carrinho.forEach(i=>{html+=`<tr><td>${i.nome}</td><td>${i.valor}</td></tr>`;soma+=i.valor});
  document.getElementById("carrinho").innerHTML=html;
  total.innerText=soma.toFixed(2);
}

function addCarrinho(){
  const [nome,valor,tipo]=produto.value.split("|");
  const cli=db.clientes.find(c=>c.nome===cliente.value);

  if(cli && cli.plano && tipo==="servico" && cli.saldo>0 && nome.toLowerCase().includes(cli.tipoPlano)){
    cli.saldo--; save(); render(); return;
  }

  carrinho.push({nome,valor:+valor});
  carrinhoRender();
}

function finalizarVenda(){
  if(!db.caixa.aberto)return alert("Abra o caixa");
  const totalVenda=carrinho.reduce((s,i)=>s+i.valor,0);
  db.vendas.push({total:totalVenda,pagamento:pagamento.value,data:new Date().toISOString()});
  carrinho=[]; save(); render();
}

function graficoRender(){
  const dados={dinheiro:0,pix:0,cartao:0};
  db.vendas.forEach(v=>dados[v.pagamento]+=v.total);
  if(grafico)grafico.destroy();
  grafico=new Chart(graficoPDV,{type:"bar",data:{labels:Object.keys(dados),datasets:[{data:Object.values(dados)}]}});
}

// ===== CRUD =====
function salvarPlano(){
  db.planos.push({nome:nomePlano.value,valor:+valorPlano.value,qtd:+qtdPlano.value,tipo:tipoPlano.value.toLowerCase()});
  save(); render();
}

function salvarCliente(){
  const plano=db.planos.find(p=>p.nome===planoCliente.value);
  db.clientes.push({nome:nomeCliente.value,plano:plano?.nome||null,saldo:plano?.qtd||0,tipoPlano:plano?.tipo||null});
  if(plano){
    db.vendas.push({total:plano.valor,pagamento:"pix",data:new Date().toISOString()});
  }
  save(); render();
}

function renovarPlano(nome){
  const cli=db.clientes.find(c=>c.nome===nome);
  const plano=db.planos.find(p=>p.nome===cli.plano);
  cli.saldo=plano.qtd;
  db.vendas.push({total:plano.valor,pagamento:"pix",data:new Date().toISOString()});
  save(); render();
}

function salvarProduto(){db.produtos.push({nome:nomeProd.value,valor:+valorProd.value,tipo:tipoProd.value});save();render();}
function salvarDespesa(){db.despesas.push({desc:descDespesa.value,valor:+valorDespesa.value,data:dataDespesa.value});save();render();}

render();
