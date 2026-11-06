const router = require('express').Router();
const db = require('../config/database');
const {hashPassword,checkPassword,makeToken,requireAuth,sessions} = require('../auth');
router.post('/cadastro',async(req,res,next)=>{
  try {
    const nome=String(req.body.nome||'').trim(), email=String(req.body.email||'').trim().toLowerCase(), senha=String(req.body.senha||'');
    if(nome.length<2||nome.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>150||senha.length<8||senha.length>128)
      return res.status(400).json({erro:'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.'});
    const [r]=await db.query('INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES (?,?,?,?)',[nome,email,hashPassword(senha),'usuario']);
    res.status(201).json({token:makeToken({id_usuario:r.insertId,tipo_usuario:'usuario'}),usuario:{nome,tipo_usuario:'usuario'}});
  } catch(e) {if(e.code==='ER_DUP_ENTRY') return res.status(409).json({erro:'E-mail já cadastrado.'});next(e);}
});
router.post('/login',async(req,res,next)=>{
  try {
    const email=String(req.body.email||'').trim().toLowerCase(), senha=String(req.body.senha||'');
    const [[u]]=await db.query('SELECT * FROM usuarios WHERE email=?',[email]);
    if(!u||!checkPassword(senha,u.senha)) return res.status(401).json({erro:'E-mail ou senha incorretos.'});
    res.json({token:makeToken(u),usuario:{nome:u.nome,tipo_usuario:u.tipo_usuario}});
  } catch(e){next(e);}
});
router.get('/me',requireAuth,(req,res)=>res.json({usuario:req.user}));
router.post('/sair',requireAuth,(req,res)=>{sessions.delete(req.token);res.json({ok:true});});
module.exports=router;
