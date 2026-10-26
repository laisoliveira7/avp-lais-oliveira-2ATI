function criarDocumentacao(porta) {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Catálogo de personagens de Harry Potter',
      version: '2.0.0',
      description: 'API REST com cadastro autenticado, CRUD persistente e upload de imagens.'
    },
    servers: [{ url: `http://localhost:${porta}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Personagem: {
          type: 'object',
          required: ['nome', 'casa', 'especie', 'ocupacao'],
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Harry Potter' },
            casa: { type: 'string', example: 'Grifinória' },
            especie: { type: 'string', example: 'Humano' },
            ocupacao: { type: 'string', example: 'Auror' },
            usuarioId: { type: 'integer', nullable: true }
          }
        },
        Credenciais: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'hermione@hogwarts.com' },
            senha: { type: 'string', format: 'password', example: 'senha1234' }
          }
        },
        NovoUsuario: {
          allOf: [
            { $ref: '#/components/schemas/Credenciais' },
            { type: 'object', required: ['nome'], properties: { nome: { type: 'string', example: 'Hermione Granger' } } }
          ]
        }
      }
    },
    paths: {
      '/': { get: { summary: 'Verifica se a API está ativa', responses: { 200: { description: 'API ativa' } } } },
      '/auth/register': {
        post: {
          summary: 'Cadastra um usuário',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NovoUsuario' } } } },
          responses: { 201: { description: 'Usuário cadastrado' }, 400: { description: 'Dados inválidos' }, 409: { description: 'E-mail já cadastrado' } }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Faz login e retorna JWT',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credenciais' } } } },
          responses: { 200: { description: 'Login realizado' }, 401: { description: 'Credenciais incorretas' } }
        }
      },
      '/personagens': {
        get: { summary: 'Lista personagens', responses: { 200: { description: 'Lista de personagens' } } },
        post: {
          summary: 'Cadastra personagem (JWT obrigatório)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Personagem' } } } },
          responses: { 201: { description: 'Personagem cadastrado' }, 400: { description: 'Dados inválidos' }, 401: { description: 'Não autenticado' } }
        }
      },
      '/personagens/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        get: { summary: 'Consulta personagem por ID', responses: { 200: { description: 'Personagem encontrado' }, 404: { description: 'Personagem não encontrado' } } },
        put: {
          summary: 'Atualiza personagem (JWT obrigatório)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Personagem' } } } },
          responses: { 200: { description: 'Personagem atualizado' }, 401: { description: 'Não autenticado' }, 404: { description: 'Personagem não encontrado' } }
        },
        delete: {
          summary: 'Exclui personagem (JWT obrigatório)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Personagem excluído' }, 401: { description: 'Não autenticado' }, 404: { description: 'Personagem não encontrado' } }
        }
      },
      '/upload': {
        post: {
          summary: 'Envia imagem JPG/PNG (máximo 5 MB; JWT obrigatório)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['imagem'], properties: { imagem: { type: 'string', format: 'binary' } } } } } },
          responses: { 200: { description: 'Imagem enviada' }, 400: { description: 'Arquivo inválido' }, 401: { description: 'Não autenticado' } }
        }
      }
    }
  };
}

module.exports = criarDocumentacao;
