const crypto = require('crypto');
const db = require('./config/database');
const sessions = new Map();
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function checkPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = crypto.scryptSync(password, parts[1], expected.length);
  return crypto.timingSafeEqual(expected, actual);
}
function makeToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { id: user.id_usuario, tipo: user.tipo_usuario, exp: Date.now() + 8*60*60*1000 });
  return token;
}
async function requireAuth(req,res,next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /i, '');
  const session = sessions.get(token);
  if (!session || session.exp < Date.now()) return res.status(401).json({erro:'Faça login para continuar.'});
  try {
    const [[user]] = await db.query('SELECT id_usuario,nome,tipo_usuario FROM usuarios WHERE id_usuario=?',[session.id]);
    if (!user) return res.status(401).json({erro:'Usuário não encontrado.'});
    req.user = user; req.token = token; next();
  } catch(e) { next(e); }
}
function requireAdmin(req,res,next) {
  if (req.user.tipo_usuario !== 'administrador') return res.status(403).json({erro:'Acesso restrito ao administrador.'});
  next();
}
module.exports={hashPassword,checkPassword,makeToken,requireAuth,requireAdmin,sessions};
