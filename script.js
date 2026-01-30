body{
  margin:0;
  font-family:Arial, Helvetica, sans-serif;
  background:url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1");
  background-size:cover;
  background-position:center;
}
.overlay{background:rgba(0,0,0,.65);min-height:100vh}
.menu{
  position:fixed;left:0;top:0;bottom:0;width:70px;
  background:rgba(0,0,0,.35);
  display:flex;flex-direction:column;align-items:center;padding-top:20px
}
.menu button{
  background:none;border:none;color:#f1c40f;font-size:22px;
  margin:15px 0;cursor:pointer
}
.content{margin-left:90px;padding:20px;color:#fff}
.section{display:none}.section.active{display:block}
input,select,button{padding:10px;border-radius:6px;border:none;margin:4px 0}
table{width:100%;border-collapse:collapse}
th,td{border-bottom:1px solid rgba(255,255,255,.2);padding:6px}
.total{font-size:22px;color:#2ecc71;margin-top:10px}
canvas{background:#fff;border-radius:10px;margin-top:15px}
