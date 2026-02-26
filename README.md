# Lumuns API Starter

Projeto inicial em **Node.js + TypeScript + Express** para você partir rápido.

> ⚠️ Não consegui abrir o link compartilhado (`chatgpt.com/share/...`) neste ambiente por bloqueio de rede (erro 403).
> Então criei uma base limpa e pronta para evoluir. Se você colar aqui os requisitos do link, eu adapto tudo para ficar igual.

## Requisitos

- Node.js 20+
- npm 10+

## Instalação

```bash
npm install
```

## Rodando em desenvolvimento

```bash
npm run dev
```

Servidor padrão: `http://localhost:3000`

## Build e execução

```bash
npm run build
npm start
```

## Endpoints

### Health check

- `GET /health`

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### Tasks (CRUD em memória)

- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Payload de criação (`POST /tasks`):

```json
{
  "title": "Estudar TypeScript",
  "done": false
}
```

## Próximos passos sugeridos

1. Persistência com PostgreSQL + Prisma.
2. Autenticação JWT.
3. Validação com Zod/Joi.
4. Testes de integração.
