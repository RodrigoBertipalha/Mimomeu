# Roadmap - MVP Mimo Meu

Este documento descreve o estado atual do MVP e as próximas melhorias que fazem
sentido para o produto.

## Fluxo atual

1. A pessoa acessa a Home.
2. Se quiser criar ou gerenciar listas, entra com e-mail/senha ou Google.
3. Em **Minhas listas**, cria uma nova lista ou escolhe uma lista existente.
4. Ao abrir uma lista, vê o resumo geral com reservados, disponíveis e progresso.
5. Na mesma tela, pesquisa, adiciona ou edita presentes.
6. O botão **Editar lista** abre um modal para alterar os dados do evento.
7. O botão **Opções** abre categorias e faixas de preço usadas nos presentes.
8. O botão **Compartilhar** abre um modal com link público, WhatsApp e e-mail.
9. O botão **Ver como convidado** abre a tela pública da lista.
10. Convidados acessam `/g/:publicSlug` sem login.
11. Convidados reservam presentes disponíveis informando nome e contato opcional.
12. A reserva atualiza o status do presente para **Reservado**.

## Rotas

- `/`: tela inicial do Mimo Meu.
- `/about`: tela institucional acessada pelo link **Sobre** do footer.
- `/support`: página de suporte, relato de problema e sugestões.
- `/login`: login e cadastro.
- `/list`: visão **Minhas listas**, protegida por login.
- `/list/:listId`: detalhe e gerenciamento da lista escolhida, protegido por login.
- `/g/:publicSlug`: visão pública do convidado.
- `/list/:listId/guest`: rota de compatibilidade para pré-visualização.

## Supabase

Estado informado em 16/06/2026: a configuração do Supabase foi feita, com
exceção da Edge Function opcional de reserva.

- Auth por e-mail e senha.
- Login com Google implementado no app e provider Google configurado no
  Supabase Auth.
- Confirmação obrigatória de e-mail desativada para o MVP.
- Postgres para listas, presentes e reservas.
- Row Level Security para restringir gestão ao dono da lista.
- Funções SQL/RPC para leitura pública e reserva sem login.
- Migration de opções de lista aplicada.

O `localStorage` permanece apenas como fallback de desenvolvimento quando as
variáveis do Supabase não estiverem configuradas.

## Decisão Sobre Edge Function

Hoje o MVP consegue reservar presente usando RPC direto no Supabase. Isso é a
opção mais simples: menos deploy, menos superfície de erro e bom o suficiente
enquanto a reserva só precisa validar disponibilidade e gravar uma linha.

A Edge Function `reserve-gift` passa a valer a pena quando a reserva precisar
de lógica que não queremos colocar toda no banco ou expor no cliente, por
exemplo:

- rate limit, captcha ou proteção anti-spam;
- validações mais ricas antes de reservar;
- envio de e-mail/WhatsApp/notificação após a reserva;
- logs estruturados e observabilidade por evento;
- integração com serviços externos;
- regras de negócio que mudam com frequência.

Opções práticas:

- **Manter RPC direto no MVP**: recomendado agora, porque é simples e já resolve.
- **Trocar para Edge Function depois**: bom quando entrar notificação, captcha ou
  integrações.
- **Híbrido**: Edge Function orquestra validações/notificações e chama RPC para a
  escrita transacional no banco.

## Funcionalidades concluídas

- Criar múltiplas listas com usuário autenticado.
- Listar listas do usuário autenticado.
- Abrir uma lista específica por clique.
- Editar dados da lista por modal.
- Editar categorias e faixas de preço por lista.
- Exibir resumo por lista: reservados, disponíveis e progresso.
- Adicionar presentes por modal.
- Editar presentes por modal.
- Pesquisar presentes dentro da lista aberta.
- Exibir status, prioridade, desconto, faixa de preço e link do presente.
- Abrir modal de compartilhamento na lista escolhida.
- Copiar/compartilhar link público da visão do convidado.
- Acessar visão do convidado em tela separada.
- Reservar presente sem login com nome e contato opcional.
- Bloquear nova reserva para presente já reservado.
- Login/cadastro por e-mail e senha.
- Login com Google no app.
- Menu de conta com logout, dados do usuário e edição de conta.
- Dark mode com alternância no header.
- Página de suporte com contato, relato de problema e sugestão.
- Manter a Home focada no fluxo operacional de criação e acesso às listas.
- Concentrar os blocos institucionais na página **Sobre**.

## Ideias Dos Protótipos

- Filtros e ordenação na visão do convidado por categoria, preço e status.
- Preview lateral ao adicionar presente, com imagem, preço, prioridade e link.
- Histórico de atividade da lista: presente criado/editado, reserva feita e
  reserva cancelada.
- Estados mais claros durante a reserva: processando, confirmado e erro.
- Melhorar a tela de gerenciamento com atalhos para presentes recentes e
  reservas recentes.

## Fora do escopo do MVP

- Pagamento, carrinho ou checkout.
- Integração real com lojas.
- Backend próprio complexo.
- Painel administrativo avançado.
- Notificações por e-mail/SMS.
- Controle financeiro.

## Próximos passos recomendados

- Conectar o repositório na Vercel.
- Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na Vercel.
- Testar cadastro, login, login Google, criação de lista e compartilhamento em
  produção.
- Manter RPC direto para reserva por enquanto e reavaliar Edge Function quando
  houver notificação, captcha ou integração externa.
- Decidir se imagens dos presentes passam para Supabase Storage.
