# Mimo Meu

MVP em React para criar, gerenciar e compartilhar listas de presentes.

## Stack

- React + Vite + TypeScript
- React Router
- TailwindCSS
- Supabase Auth + Postgres
- Vercel para deploy
- Fallback local via `localStorage` apenas quando Supabase não estiver configurado

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

## Fluxo do MVP

- Home em `/`.
- Página institucional em `/about`, acessada pelo link **Sobre** do footer.
- Login/cadastro em `/login`.
- Visão **Minhas listas** em `/list`, protegida por login.
- Detalhe de uma lista em `/list/:listId`, protegido por login.
- Criação e edição de lista por modal.
- Adição e edição de presentes por modal.
- Compartilhamento por modal com link, WhatsApp e e-mail.
- Visão pública do convidado em `/g/:publicSlug`.
- Reserva de presente sem login, com nome e contato opcional.

## Supabase

Os arquivos necessários estão em:

- `supabase/migrations/202606140001_initial_schema.sql`
- `supabase/functions/reserve-gift/index.ts`

Antes do deploy, aplique a migration no projeto Supabase e configure as URLs de
redirect do Auth para localhost e para o domínio final.

## Produção

O checklist completo está em `docs/production-checklist.md`.
