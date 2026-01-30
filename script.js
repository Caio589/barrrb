// 🔒 DB BLINDADO
let db = JSON.parse(localStorage.getItem("db")) || {};
db.clientes = Array.isArray(db.clientes) ? db.clientes : [];
db.produtos = Array.isArray(db.produtos) ? db.produtos : [];
db.vendas   = Array.isArray(db.vendas)   ? db.vendas   : [];
db.agenda   = Array.isArray(db.agenda)   ? db.agenda   : [];

// dados iniciais (evita tela vazia)
if(db.produtos.length === 0){
  db.produtos.push(
    {nome:"Corte", valor:30},
    {nome:"Barba", valor:20}
  );
}

let carrinho = [];
let grafico = null;

function save(){
  localStorage.setItem("db", JSON.stringify(db));
}

function show(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  render();
}

function render(){
  cliente.innerHTML = db.clientes.map(c=>`<option>${c}</option>`).join("");
  produto.innerHTML = db.produtos.map(p=>`<option>${p.nome}|${p.valor}</option>`).join("");
  listaClientes.innerHTML = db.clientes.map(c=>`<li>${c}</li>`).join("");
  listaAgenda.innerHTML = db.agenda.map(a=>`<li>${a.data} ${a.hora} - ${a.cliente}</li>`).join("");
  carrinhoRender();
  graficoRender();
}

function carrinhoRender(){
  let html="<tr><th>Item</th><th>Valor</th></tr>";
  let soma=0;
  carrinho.forEach(i=>{
    html+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    soma+=i.valor;
  });
  document.getElementById("carrinho").innerHTML = html;
  total.innerText = soma.toFixed(2);
}

function addCarrinho(){
  const [nome,valor] = produto.value.split("|");
  carrinho.push({nome, valor:+valor});
  carrinhoRender();
}

function finalizarVenda(){
  if(!cliente.value || !pagamento.value || !carrinho.length){
    alert("Preencha tudo");
    return;
  }

  const totalVenda = carrinho.reduce((s,i)=>s+i.valor,0);

  if(pagamento.value === "dinheiro"){
    const pago = +valorPago.value;
    if(pago < totalVenda){
      alert("Valor insuficiente");
      return;
    }
    troco.innerText = "Troco: R$ " + (pago-totalVenda).toFixed(2);
  }

  db.vendas.push({
    total: totalVenda,
    pagamento: pagamento.value,
    data: new Date().toISOString()
  });

  carrinho = [];
  save();
  render();
}

function graficoRender(){
  const ctx = document.getElementById("graficoPDV");
  const dados = {dinheiro:0, pix:0, cartao:0};

  db.vendas.forEach(v=>{
    if(dados[v.pagamento] !== undefined){
      dados[v.pagamento] += v.total;
    }
  });

  if(grafico) grafico.destroy();

  grafico = new Chart(ctx,{
    type:"bar",
    data:{
      labels:Object.keys(dados),
      datasets:[{
        label:"Faturamento por pagamento",
        data:Object.values(dados)
      }]
    },
    options:{animation:false}
  });
}

function salvarCliente(){
  if(nomeCliente.value){
    db.clientes.push(nomeCliente.value);
    nomeCliente.value="";
    save();
    render();
  }
}

function salvarAgenda(){
  db.agenda.push({
    data:dataAgenda.value,
    hora:horaAgenda.value,
    cliente:clienteAgenda.value
  });
  save();
  render();
}

render();
