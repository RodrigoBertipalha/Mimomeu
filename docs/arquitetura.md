# Arquitetura

## Stack

- **Front:** React 19 + TypeScript + Vite 8 + Tailwind 3 + React Router 7.
- **Backend:** Supabase (Auth e-mail/senha + Google, Postgres com RLS, funções RPC).
  Não há servidor próprio.
- **Deploy:** Vercel (SPA com rewrite de tudo para `index.html`, ver `vercel.json`).
  Domínio atual: `mimomeu.vercel.app`.

## Pastas

```
src/
  App.tsx                 rotas
  lib/supabase.ts         cria o cliente (vite.config.js injeta URL e chave, aceitando vários nomes)
  auth/                   AuthProvider (sessão, login, cadastro, Google, editar conta)
  hooks/useWishlist.ts    "cérebro" do app: decide remoto x local e expõe as ações
  services/
    wishlistRepository.ts todas as chamadas ao Supabase de listas/presentes/reservas
    supportRepository.ts  envio de mensagem de suporte
  utils/
    gifts.ts              regras de disponibilidade, contribuição e quantidade
    listTypes.ts          textos e flags por tipo de lista (gift x potluck)
    wishlistOptions.ts    categorias e faixas de preço padrão
    activity.ts           histórico (mensagens, normalização, limite de 60)
    date.ts               formata datas de evento (dd/mm/aaaa ou "12 de dezembro de 2026")
    image.ts              comprime fotos no navegador (1200 px, WebP)
    share/share.ts        link público, mensagem de WhatsApp/e-mail
  pages/                  Home, Login, Minhas listas, Detalhe, Convidado, Suporte, Sobre
  components/             formulários, cards, modais, layout
supabase/
  migrations/             schema completo (aplicar em ordem no SQL Editor)
design/                   protótipos HTML/PNG (Stitch) usados como referência visual
```

## Rotas

| Rota | Tela | Login |
| --- | --- | --- |
| `/` | HomePage | não |
| `/about` | AboutPage | não |
| `/support` | SupportPage | não |
| `/login` | AuthPage (`?mode=signup`, `?next=`) | não |
| `/list` | ListPage, Minhas listas (`?new=1` abre o modal de criação) | sim |
| `/list/:listId` | ListDetailPage, gestão da lista | sim |
| `/g/:publicSlug` | GuestListPage, visão pública do convidado | não |
| `/list/:listId/guest` | GuestListPage (compatibilidade, aceita o id) | não |

## Fluxo de dados

```
Página -> useWishlist() -> wishlistRepository -> supabase-js -> Postgres (RLS)
                                             \-> rpc get_public_wishlist / reserve_public_gift
```

- `hooks/WishlistProvider.tsx` (em volta do app, dentro do `AuthProvider`) guarda as listas
  do dono logado num só lugar; `useWishlist()` lê esse contexto. As listas são carregadas uma
  vez por usuário, e trocar de tela não busca de novo.
- Atualização em segundo plano: "Minhas listas" chama `refresh()` (todas as listas) e o
  Detalhe chama `refreshList(id)` (só aquela lista) ao abrir. A tela mostra o que está em
  memória na hora e se atualiza quando a resposta chega, sem tela de "Carregando".
- Em desenvolvimento, o `StrictMode` faz cada busca aparecer duas vezes na rede; em produção
  é uma só.
- Depois de cada escrita, o repositório recarrega **só a lista afetada** (`fetchWishlist`) e o
  hook a substitui no estado.
- A página do convidado chama o repositório direto (`fetchPublicWishlist`,
  `reserveRemotePublicGift`), sem `useWishlist`.
- Não há mais modo offline (localStorage): sem Supabase, o app mostra a tela de configuração.
- Avisos usam `components/ui/Toast.tsx` (fixo no rodapé); exclusões usam
  `components/ui/ConfirmDialog.tsx`; todos os modais fecham com ESC (`hooks/useEscapeKey.ts`).

## Histórico (activity log)

Fica num JSON `wishlists.activity_log` (máx. 60 itens). Ações do dono são montadas **no
navegador** e o array inteiro é regravado. Reservas de convidados são inseridas pela função SQL.
Se as duas coisas acontecem ao mesmo tempo, uma pode sobrescrever a outra.

## Imagens

- Ao escolher a foto, `utils/image.ts` reduz para no máximo 1200 px e converte para WebP
  (JPEG se o navegador não suportar). A prévia usa uma URL local, sem enviar nada.
- Ao salvar, `services/imageStorage.ts` envia para o bucket `gift-images` e grava a URL
  pública em `gifts.image_url`. Se o salvamento do presente falhar, o arquivo enviado é apagado.
- Trocar a foto, "Remover foto", excluir o presente ou excluir a lista apagam o arquivo antigo
  (best-effort: uma falha só gera aviso no console).
- Fotos antigas em base64 continuam funcionando; são dados de teste e não foram migradas.
