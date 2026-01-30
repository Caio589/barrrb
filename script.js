// DB BLINDADO
let db = JSON.parse(localStorage.getItem("db")) || {};
db.clientes = Array.isArray(db.clientes)?db.clientes:[];
db.planos   = Array.isArray(db.planos)?db.planos:[];
db.produtos = Array.isArray(db.produtos)?db.produtos:[];
db.vendas   = Array.isArray(db.vendas)?db.vendas:[];
db.despesas = Array.isArray(db.despesas)?db.despesas:[];
db.agenda   = Array.isArray(db.agenda)?db.agenda:[];
db.caixa    = db.caixa || {aberto:false,data:null,abertura:0};

let carrinho=[];
let grafico=null;

function save(){localStorage.setItem("db",JSON.stringify(db));}

function show(id){
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
render();
}

function render(){
cliente.innerHTML=db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
planoCliente.innerHTML=`<option value="">Sem plano</option>`+db.planos.map(p=>`<option>${p.nome}</option>`).join("");
produto.innerHTML=db.produtos.map(p=>`<option>${p.nome}|${p.valor}|${p.tipo}</option>`).join("");

listaClientes.innerHTML=db.clientes.map(c=>`<li>${c.nome} | Plano: ${c.plano||"Nenhum"} | Saldo: ${c.saldo||0}</li>`).join("");
listaPlanos.innerHTML=db.planos.map(p=>`<li>${p.nome} (${p.qtd} ${p.tipo})</li>`).join("");
listaEstoque.innerHTML=db.produtos.map(p=>`<li>${p.nome} - R$ ${p.valor}</li>`).join("");
listaDespesas.innerHTML=db.despesas.map(d=>`<li>${d.data} - ${d.desc} R$ ${d.valor}</li>`).join("");
listaAgenda.innerHTML=db.agenda.map(a=>`<li>${a.data} ${a.hora} - ${a.cliente}</li>`).join("");

renderCaixa();
carrinhoRender();
graficoRender();
}

function carrinhoRender(){
let html="<tr><th>Item</th><th>Valor</th></tr>",soma=0;
carrinho.forEach(i=>{html+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;soma+=i.valor});
document.getElementById("carrinho").innerHTML=html;
total.innerText=soma.toFixed(2);
}

function addCarrinho(){
const [nome,valor,tipo]=produto.value.split("|");
const cli=db.clientes.find(c=>c.nome===cliente.value);
if(cli && cli.plano && tipo==="servico" && cli.saldo>0 && nome.toLowerCase().includes(cli.tipoPlano.toLowerCase())){
cli.saldo--; alert("Plano usado"); save(); render(); return;
}
carrinho.push({nome,valor:+valor});
carrinhoRender();
}

function finalizarVenda(){
if(!db.caixa.aberto)return alert("Abra o caixa primeiro");
if(!cliente.value||!pagamento.value||!carrinho.length)return alert("Preencha tudo");

const totalVenda=carrinho.reduce((s,i)=>s+i.valor,0);

if(pagamento.value==="dinheiro"){
const pago=+valorPago.value;
if(pago<totalVenda)return alert("Valor insuficiente");
troco.innerText="Troco: R$ "+(pago-totalVenda).toFixed(2);
}

db.vendas.push({total:totalVenda,pagamento:pagamento.value,data:new Date().toISOString()});
carrinho=[]; save(); render();
}

function graficoRender(){
const ctx=document.getElementById("graficoPDV");
const dados={dinheiro:0,pix:0,cartao:0};
db.vendas.forEach(v=>dados[v.pagamento]+=v.total);
if(grafico)grafico.destroy();
grafico=new Chart(ctx,{type:"bar",data:{labels:Object.keys(dados),datasets:[{label:"Faturamento",data:Object.values(dados)}]},options:{animation:false}});
}

// CRUDs
function salvarCliente(){
const plano=db.planos.find(p=>p.nome===planoCliente.value);
db.clientes.push({nome:nomeCliente.value,plano:plano?.nome||null,saldo:plano?.qtd||0,tipoPlano:plano?.tipo||null});
nomeCliente.value=""; save(); render();
}
function salvarPlano(){db.planos.push({nome:nomePlano.value,qtd:+qtdPlano.value,tipo:tipoPlano.value});save();render();}
function salvarProduto(){db.produtos.push({nome:nomeProd.value,valor:+valorProd.value,tipo:tipoProd.value});save();render();}
function salvarDespesa(){db.despesas.push({desc:descDespesa.value,valor:+valorDespesa.value,data:dataDespesa.value});save();render();}
function salvarAgenda(){db.agenda.push({data:dataAgenda.value,hora:horaAgenda.value,cliente:clienteAgenda.value,servico:servicoAgenda.value});save();render();}

// CAIXA
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

const despesasDia=db.despesas.filter(d=>d.data===hoje).reduce((s,d)=>s+d.valor,0);
const totalVendas=dinheiro+pix+cartao;
const lucro=totalVendas-despesasDia;

const contado=prompt("Valor contado em dinheiro:");
const diferenca=(+contado||0)-(dinheiro+db.caixa.abertura);

resumoCaixa.innerHTML=`Dinheiro: R$ ${dinheiro.toFixed(2)}<br>Pix: R$ ${pix.toFixed(2)}<br>Cartão: R$ ${cartao.toFixed(2)}<br>Lucro: R$ ${lucro.toFixed(2)}<br>Diferença: R$ ${diferenca.toFixed(2)}`;

const {jsPDF}=window.jspdf;
const pdf=new jsPDF();
pdf.text("FECHAMENTO DE CAIXA",10,10);
pdf.text("Data: "+hoje,10,20);
pdf.text("Lucro: R$ "+lucro.toFixed(2),10,30);
pdf.save("fechamento-"+hoje+".pdf");

db.caixa={aberto:false,data:null,abertura:0};
save(); renderCaixa();
}

function renderCaixa(){
caixaFechado.style.display=db.caixa.aberto?"none":"block";
caixaAberto.style.display=db.caixa.aberto?"block":"none";
}

render();
