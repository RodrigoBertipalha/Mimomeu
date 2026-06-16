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
- [x] Criar pasta `supabase/functions` com Edge Function opcional para reserva.
- [x] Criar projeto no Supabase.
- [x] Aplicar a migration `supabase/migrations/202606140001_initial_schema.sql`.
- [x] Aplicar a migration `supabase/migrations/202606160001_wishlist_options.sql`.
- [x] Conferir se Auth por e-mail/senha está habilitado.
- [x] Desativar confirmação de e-mail no Supabase Auth para o MVP.
- [x] Configurar URLs de redirect do Supabase para localhost e domínio final.
- [x] Configurar provider Google no Supabase Auth e credenciais no Google Cloud.
- [ ] Publicar Edge Function `reserve-gift`, se optar por usar function em vez de RPC direto.

## Decisão Sobre Edge Function

- [x] Manter RPC direto como caminho atual de reserva no MVP.
- [ ] Reavaliar Edge Function quando precisar de rate limit, captcha,
  notificação, integração externa ou logs mais completos.

## Aplicação

- [x] Instalar `@supabase/supabase-js`.
- [x] Criar cliente Supabase com `VITE_SUPABASE_URL` e publishable key.
- [x] Criar `.env.example`.
- [x] Configurar `.env` local.
- [x] Validar conexão local com Supabase.
- [x] Criar camada de autenticação.
- [x] Criar tela de login/cadastro.
- [x] Adicionar login com Google na tela de autenticação.
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
- [ ] Configurar variáveis de ambiente na Vercel, sem subir `.env` para o GitHub.
- [ ] Testar cadastro/login em produção.
- [ ] Testar login com Google em produção.
- [ ] Testar criação de lista em produção.
- [ ] Testar compartilhamento público em janela anônima.
- [ ] Testar reserva de presente em janela anônima.
- [ ] Definir domínio final.

## Pós-MVP

- [ ] Decidir se imagens dos presentes serão upload real no Supabase Storage.
- [ ] Criar política de privacidade.
- [ ] Criar termos simples de uso.
- [ ] Adicionar observabilidade básica.
- [ ] Adicionar filtros e ordenação na visão do convidado.
- [ ] Adicionar preview lateral ao cadastrar presente.
- [ ] Adicionar histórico de atividade da lista.
