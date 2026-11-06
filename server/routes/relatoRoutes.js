const router=require('express').Router();
const db=require('../config/database');
const {requireAuth,requireAdmin}=require('../auth');
router.get('/mapa',async(req,res,next)=>{try {
 const [rows]=await db.query(`SELECT r.id_relato,r.descricao,r.data_relato,c.nome AS categoria,l.latitude,l.longitude,l.endereco FROM relatos r JOIN categorias c ON c.id_categoria=r.id_categoria JOIN localizacoes l ON l.id_localizacao=r.id_localizacao WHERE r.status='aprovado' ORDER BY r.data_relato DESC LIMIT 300`);
 res.json(rows);
}catch(e){next(e);}});
router.post('/',requireAuth,async(req,res,next)=>{
 const id=Number(req.body.id_categoria), lat=Number(req.body.latitude),lon=Number(req.body.longitude);
 const descricao=String(req.body.descricao||'').trim(),endereco=String(req.body.endereco||'').trim().slice(0,255);
 if(!Number.isInteger(id)||id<1||!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat>90||lon < -180||lon>180||descricao.length<10||descricao.length>2000)
   return res.status(400).json({erro:'Selecione uma categoria, marque um local no mapa e escreva ao menos 10 caracteres.'});
 const con=await db.getConnection();
 try {await con.beginTransaction();
   const [[cat]]=await con.query('SELECT id_categoria FROM categorias WHERE id_categoria=?',[id]);
   if(!cat){await con.rollback();return res.status(400).json({erro:'Categoria inválida.'});}
   const [loc]=await con.query('INSERT INTO localizacoes (latitude,longitude,endereco) VALUES (?,?,?)',[lat,lon,endereco||null]);
   await con.query('INSERT INTO relatos (id_usuario,id_categoria,id_localizacao,descricao,status) VALUES (?,?,?,?,?)',[req.user.id_usuario,id,loc.insertId,descricao,'pendente']);
   await con.commit();res.status(201).json({mensagem:'Relato enviado para análise.'});
 }catch(e){await con.rollback();next(e);}finally{con.release();}
});
router.get('/pendentes',requireAuth,requireAdmin,async(req,res,next)=>{try {
 const [rows]=await db.query(`SELECT r.id_relato,r.descricao,r.data_relato,c.nome AS categoria,l.endereco,u.nome AS autor FROM relatos r JOIN categorias c ON c.id_categoria=r.id_categoria JOIN localizacoes l ON l.id_localizacao=r.id_localizacao JOIN usuarios u ON u.id_usuario=r.id_usuario WHERE r.status='pendente' ORDER BY r.data_relato ASC LIMIT 200`);res.json(rows);
}catch(e){next(e);}});
router.patch('/:id/status',requireAuth,requireAdmin,async(req,res,next)=>{try {
 const id=Number(req.params.id), status=req.body.status;
 if(!Number.isInteger(id)||id<1||!['aprovado','recusado'].includes(status))return res.status(400).json({erro:'Dados inválidos.'});
 const [r]=await db.query("UPDATE relatos SET status=? WHERE id_relato=? AND status='pendente'",[status,id]);
 if(!r.affectedRows)return res.status(404).json({erro:'Relato pendente não encontrado.'});
 res.json({mensagem:'Relato atualizado.'});
}catch(e){next(e);}});
module.exports=router;
