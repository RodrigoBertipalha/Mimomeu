# Mimo Meu

MVP em React para criar, gerenciar e compartilhar listas de presentes,
presentes financeiros e confraternizações.

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
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable-publica
```

No painel novo do Supabase, copie a **Publishable key**. O nome antigo
`anon key` ainda aparece em alguns tutoriais, mas a chave pública atual é a
publishable.

## Fluxo do MVP

- Home em `/`.
- Página institucional em `/about`, acessada pelo link **Sobre** do footer.
- Login/cadastro em `/login`.
- Visão **Minhas listas** em `/list`, protegida por login.
- Detalhe de uma lista em `/list/:listId`, protegido por login.
- Criação e edição de lista por modal, escolhendo entre lista de presentes e
  confraternização.
- Adição e edição de presentes ou itens para levar por modal.
- Presentes de lista podem ser comuns ou financeiros, com meta configurada e
  contribuição por valor cheio ou em grupo.
- Compartilhamento por modal com link, WhatsApp e e-mail.
- Visão pública do convidado em `/g/:publicSlug`.
- Reserva de presente sem login, com nome e contato opcional.
- Contribuição em presente financeiro sem login, registrando nome, contato
  opcional e valor combinado.
- Reserva de item de confraternização por múltiplas pessoas até atingir o total
  configurado pelo administrador.

## Supabase

Os arquivos necessários estão em:

- `supabase/migrations/202606140001_initial_schema.sql`
- `supabase/migrations/202606160001_wishlist_options.sql`
- `supabase/migrations/202606160002_activity_and_support.sql`
- `supabase/migrations/202606180001_list_kinds_and_potluck.sql`
- `supabase/migrations/202606180002_financial_gifts.sql`
- `supabase/functions/reserve-gift/index.ts`

Antes do deploy, aplique a migration no projeto Supabase e configure as URLs de
redirect do Auth para localhost e para o domínio final.

## Produção

O checklist completo está em `docs/production-checklist.md`.
