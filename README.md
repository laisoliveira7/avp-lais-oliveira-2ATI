# API Harry Potter — AV1 Backend

Backend REST para catálogo de personagens do universo Harry Potter. O projeto original já tinha CRUD, cadastro/login com bcrypt e JWT, Swagger e upload de imagens. Nesta etapa, essas funcionalidades foram organizadas em MVC; personagens e usuários agora ficam persistidos em SQLite usando Sequelize.

## Tecnologias

- Node.js 18 ou superior e Express 5
- Sequelize 6 com SQLite
- bcrypt para hash de senha e jsonwebtoken para JWT
- dotenv para configuração local
- Multer para upload de imagens e Swagger UI para documentação
- Node.js Test Runner e Supertest para testes HTTP

## Requisitos e instalação

Abra um terminal nesta pasta do projeto (a que contém este README) e instale as dependências:

```powershell
npm install
```

Crie o arquivo local `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e substitua `JWT_SECRET` por uma chave aleatória longa, de pelo menos 32 caracteres. Não compartilhe nem envie o `.env` ao GitHub. `DATABASE_URL` deve manter o formato SQLite ilustrado abaixo. O arquivo do banco será criado automaticamente na primeira inicialização.

```env
PORT=3000
JWT_SECRET=coloque_sua_chave_aleatoria_local_aqui
JWT_EXPIRES_IN=1h
DATABASE_URL=sqlite:./database.sqlite
```

O servidor verifica a conexão e sincroniza as tabelas `usuarios` e `personagens` na inicialização. Se a tabela de personagens estiver vazia, cria o personagem de exemplo Harry Potter que já existia no projeto. Não apague `database.sqlite` se quiser manter os dados locais.

## Iniciar

```powershell
npm start
```

Para desenvolvimento, com reinício automático ao alterar arquivos:

```powershell
npm run dev
```

A API fica em `http://localhost:3000`; Swagger em `http://localhost:3000/api-docs`. `PORT` pode mudar a porta.

## Arquitetura

- `src/config`: conexão com o SQLite e definição Swagger.
- `src/models`: modelos Sequelize e relacionamento opcional de criador.
- `src/controllers`: regras de cadastro/login e CRUD.
- `src/middlewares`: validação do token Bearer JWT.
- `src/routes`: rotas de autenticação, personagens e upload.
- `src/app.js`: configuração Express; `src/server.js`: conexão e inicialização.

O campo `usuarioId` de um personagem pode ser nulo para permitir os registros de exemplo legados; novos personagens recebem o ID do usuário autenticado.

## Endpoints

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| GET | `/` | Público | Verifica se a API está ativa |
| POST | `/auth/register` | Público | Cria usuário |
| POST | `/auth/login` | Público | Valida credenciais e retorna JWT |
| GET | `/personagens` | Público | Lista personagens |
| GET | `/personagens/:id` | Público | Consulta um personagem |
| POST | `/personagens` | JWT | Cadastra personagem |
| PUT | `/personagens/:id` | JWT | Atualiza personagem (envie todos os campos) |
| DELETE | `/personagens/:id` | JWT | Exclui personagem |
| POST | `/upload` | JWT | Envia imagem JPG/JPEG/PNG até 5 MB no campo `imagem` |
| GET | `/api-docs` | Público | Documentação interativa Swagger |

As rotas antigas `POST /usuarios` e `POST /login` continuam como aliases compatíveis. O upload continua disponível em `/upload` e os arquivos ficam servidos em `/uploads/...`.

### Exemplo: cadastrar usuário

`POST /auth/register`, Content-Type `application/json`:

```json
{
  "nome": "Hermione Granger",
  "email": "hermione@hogwarts.com",
  "senha": "senha-segura-123"
}
```

Resposta `201` (senha e hash não são retornados):

```json
{
  "mensagem": "Usuário cadastrado com sucesso.",
  "usuario": {
    "id": 1,
    "nome": "Hermione Granger",
    "email": "hermione@hogwarts.com"
  }
}
```

E-mail duplicado retorna `409`; dados inválidos retornam `400`. A senha precisa ter pelo menos 8 caracteres.

### Exemplo: login e token

`POST /auth/login`:

```json
{
  "email": "hermione@hogwarts.com",
  "senha": "senha-segura-123"
}
```

A resposta contém `token`. Envie-o nas rotas protegidas no cabeçalho:

```text
Authorization: Bearer <token>
```

Credenciais incorretas retornam `401`. Token ausente, inválido ou expirado também retorna `401`.

### Exemplo: CRUD

Com o cabeçalho Bearer, envie `POST /personagens` com:

```json
{
  "nome": "Luna Lovegood",
  "casa": "Corvinal",
  "especie": "Humano",
  "ocupacao": "Bruxa"
}
```

A resposta `201` inclui o ID criado. Use esse ID em `GET /personagens/:id`, `PUT /personagens/:id` e `DELETE /personagens/:id`. O PUT exige os quatro campos. Registros inexistentes retornam `404`; campos inválidos retornam `400`.

## Testes

Execute a suíte automatizada:

```powershell
npm test
```

Os testes HTTP usam SQLite em memória e verificam registro, campos inválidos, e-mail duplicado, login correto/incorreto, JWT ausente/inválido, CRUD protegido e 404. Um teste separado cria um banco temporário, fecha a conexão e abre outra para comprovar que um personagem continua salvo. Os dados dos testes não alteram o banco local de desenvolvimento.

Para uma verificação manual, use Postman, Insomnia ou Swagger: registre um usuário, tente repetir o e-mail, faça login, tente criar personagem sem token (401), e então repita com `Authorization: Bearer <token>`. Liste, consulte, atualize e exclua o personagem; reinicie o servidor e confirme que registros não excluídos continuam na listagem.

## Dados locais e segurança

`.env`, bancos SQLite e imagens enviadas são ignorados pelo Git. Versione apenas `.env.example`, que contém valores ilustrativos. Não use segredos do exemplo em produção. As respostas de usuário nunca incluem a senha ou seu hash; erros inesperados são registrados no servidor sem expor detalhes internos ao cliente.
