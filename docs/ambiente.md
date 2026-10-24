# Ambiente e deploy

## Rodar localmente

```
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Variáveis de ambiente (`.env.local`, fora do git)

```
VITE_SUPABASE_URL=https://fzxrtoqmjlsgtoxywioj.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key, sb_publishable_...>
```

- Use a URL base, **sem** `/rest/v1/`.
- Nomes aceitos para a chave: `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SUPABASE_*` ou `SUPABASE_*`. O `vite.config.js` converte todos para
  `import.meta.env.VITE_SUPABASE_ANON_KEY`, que é o que `src/lib/supabase.ts` lê.
- As linhas não podem estar comentadas com `#`.
- Onde pegar: Supabase → Project Settings → API Keys (Publishable key) e Data API (URL).
- O Vite só lê o `.env` ao iniciar: depois de alterar, reinicie o `npm run dev`.
- Sem as variáveis, o app mostra "Supabase não configurado" e as rotas de gestão ficam
  bloqueadas.

## Testar no celular sem publicar

Com o `npm run dev` rodando, abra um túnel público (sem conta, gratuito):

```
%USERPROFILE%\cloudflared\cloudflared.exe tunnel --url http://localhost:5173
```

Ele mostra um link `https://xxxx.trycloudflare.com` que abre de qualquer lugar enquanto o
servidor e o túnel estiverem rodando. O `vite.config.js` já libera `.trycloudflare.com` em
`server.allowedHosts` (só vale no modo dev). O link muda a cada vez que o túnel é aberto.

## Supabase

- Plano gratuito: o projeto **pausa por inatividade**. Sintoma: o app para de carregar
  dados. Solução: painel do Supabase → "Resume project".
- Migrations: aplicar manualmente no SQL Editor, em ordem (ver [banco-de-dados.md](banco-de-dados.md)).
- Auth: e-mail/senha (confirmação de e-mail desligada) e Google OAuth. URLs de redirect
  precisam incluir `http://localhost:5173/login` e o domínio de produção `/login`.
- Mensagens de suporte: só no painel (Table Editor → `support_messages`).

## Deploy (Vercel)

Push no GitHub dispara o deploy. Variáveis configuradas no painel da Vercel com os mesmos
nomes `VITE_*`. `vercel.json` reescreve todas as rotas para o SPA.
