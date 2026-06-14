# Checklist de Produção - Mimo Meu

Use este arquivo como controle do que já foi preparado para colocar o MVP em
produção com autenticação, banco remoto e compartilhamento público.

## Arquitetura

- [x] Definir stack base: React + Vite, Vercel e Supabase.
- [x] Manter pagamento, checkout e integrações comerciais fora do escopo.
- [x] Definir que convidados acessam listas públicas sem login.
- [x] Definir que criação e gestão de listas exigem login.

## Supabase

- [x] Criar pasta `supabase/migrations` com schema, RLS, triggers e funções SQL.
- [x] Criar pasta `supabase/functions` com edge function opcional para reserva.
- [x] Criar projeto no Supabase.
- [x] Aplicar a migration `supabase/migrations/202606140001_initial_schema.sql`.
- [x] Conferir se Auth por e-mail/senha está habilitado.
- [ ] Configurar URLs de redirect do Supabase para localhost e domínio final.
- [ ] Publicar edge function `reserve-gift`, se optar por usar function em vez de RPC direto.

## Aplicação

- [x] Instalar `@supabase/supabase-js`.
- [x] Criar cliente Supabase com variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [x] Criar `.env.example`.
- [x] Configurar `.env` local.
- [x] Validar conexão local com Supabase.
- [x] Criar camada de autenticação.
- [x] Criar tela de login/cadastro.
- [x] Proteger rotas de gestão de listas.
- [x] Migrar operações de listas/presentes para Supabase quando houver sessão.
- [x] Manter fallback local para desenvolvimento sem Supabase configurado.
- [x] Criar rota pública `/g/:publicSlug`.
- [x] Ajustar compartilhamento para usar link público.
- [x] Validar `npm run build`.
- [x] Validar `npm run lint`.
- [x] Validar `npm audit --omit=dev`.

## Deploy

- [x] Criar repositório no GitHub.
- [ ] Conectar repositório na Vercel.
- [ ] Configurar variáveis de ambiente na Vercel.
- [ ] Testar cadastro/login em produção.
- [ ] Testar criação de lista em produção.
- [ ] Testar compartilhamento público em janela anônima.
- [ ] Testar reserva de presente em janela anônima.
- [ ] Definir domínio final.

## Pós-MVP

- [ ] Decidir se imagens dos presentes serão upload real no Supabase Storage.
- [ ] Criar política de privacidade.
- [ ] Criar termos simples de uso.
- [ ] Adicionar observabilidade básica.
