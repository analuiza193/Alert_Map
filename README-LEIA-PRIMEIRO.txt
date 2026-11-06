ALERTMAP — VERSÃO DE ENTREGA

1. Extraia este ZIP para uma pasta no computador.
2. O banco MySQL `alert_map` deve existir com as tabelas originais: usuarios, categorias, localizacoes, relatos.
3. Abra a pasta `server` no terminal do VS Code.
4. Execute `npm install` (requer internet; instala express e mysql2).
5. Configure as variáveis de ambiente no PowerShell (troque os valores pelos seus, sem enviar senhas a ninguém):
   $env:DB_PASSWORD="SUA_SENHA_MYSQL"
   $env:ADMIN_EMAIL="admin@exemplo.com"
   $env:ADMIN_PASSWORD="CRIE_UMA_SENHA_FORTE"
   node server.js
   OBS: no terminal CMD, use `set DB_PASSWORD=SUA_SENHA_MYSQL` etc.
6. Abra http://localhost:3000 no Opera. NÃO use Live Server nesta versão.
7. Cadastre um usuário normal e envie um relato. Entre como administrador usando o e-mail e senha configurados no passo 5, aprove o relato e confira o mapa.

IMPORTANTE:
- O administrador é criado automaticamente no PRIMEIRO início com ADMIN_EMAIL e ADMIN_PASSWORD. Se o e-mail já existir como usuário comum, use outro.
- Não publique este servidor na internet: ele foi preparado para demonstração local. Tokens são mantidos em memória e expiram após 8 horas; reiniciar o servidor exige novo login.
- A biblioteca do mapa e os mapas-base precisam de internet.
- O banco usa as tabelas já criadas, sem apagar dados. Relatos novos ficam pendentes até aprovação.
- Evite inserir nomes de pessoas, informações pessoais ou endereços de residências nos relatos.
- Senhas novas usam hash scrypt; senhas antigas em texto simples não são aceitas no login, sendo necessário cadastrar nova conta.
- Caso o usuário root do MySQL não tenha senha, omita DB_PASSWORD.
