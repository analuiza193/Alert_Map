require("dotenv").config();
const express=require('express');
const path=require('path');
const db=require('./config/database');
const {hashPassword}=require('./auth');
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'30kb'}));
app.use('/api/categorias',require('./routes/categoriaRoutes'));
app.use('/api/usuarios',require('./routes/usuarioRoutes'));
app.use('/api/relatos',require('./routes/relatoRoutes'));
app.use('/api',(req,res)=>res.status(404).json({erro:'Rota não encontrada.'}));
app.use(express.static(path.join(__dirname,'..')));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({erro:'Erro interno no servidor.'});});
async function start(){
 await db.query('SELECT 1');
 const email=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
 const pass=process.env.ADMIN_PASSWORD||'';
 if(email&&pass){
   if(pass.length<8) throw Error('ADMIN_PASSWORD precisa ter 8 ou mais caracteres.');
   const [[existing]]=await db.query('SELECT id_usuario,tipo_usuario FROM usuarios WHERE email=?',[email]);
   if(!existing){await db.query('INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES (?,?,?,?)',['Administrador',email,hashPassword(pass),'administrador']);console.log('Conta administrativa criada.');}
   else if(existing.tipo_usuario!=='administrador') console.warn('ADMIN_EMAIL já pertence a um usuário comum. Escolha outro e-mail.');
 }
 app.listen(process.env.PORT||3000,()=>console.log('AlertMap disponível em http://localhost:'+(process.env.PORT||3000)));
}
start().catch(e=>{console.error('Falha ao iniciar:',e.message);process.exit(1);});
