const router = require('express').Router();
const db = require('../config/database');
router.get('/',async(req,res,next)=>{try {const [rows]=await db.query('SELECT id_categoria,nome FROM categorias ORDER BY id_categoria');res.json(rows);}catch(e){next(e);}});
module.exports=router;
