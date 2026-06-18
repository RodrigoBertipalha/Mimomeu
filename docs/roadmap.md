# Roadmap - MVP Mimo Meu

Este documento descreve o estado atual do MVP e as próximas melhorias que fazem
sentido para o produto.

## Fluxo atual

1. A pessoa acessa a Home.
2. Se quiser criar ou gerenciar listas, entra com e-mail/senha ou Google.
3. Em **Minhas listas**, cria uma nova lista ou escolhe uma lista existente.
4. Ao criar uma lista, escolhe o tipo: lista de presentes ou confraternização.
5. Ao abrir uma lista, vê o resumo geral com reservados, disponíveis e progresso.
6. Na mesma tela, pesquisa, adiciona ou edita presentes/itens com preview lateral.
7. O botão **Editar lista** abre um modal para alterar os dados do evento.
8. O botão **Opções** abre categorias e faixas de preço da lista, permitindo
   ligar/desligar cada grupo conforme a necessidade.
9. O botão **Compartilhar** abre um modal com link público, WhatsApp e e-mail.
10. O botão **Ver como convidado** abre a tela pública da lista.
11. O histórico da lista mostra criação/edição de presentes, reservas e
    liberações.
12. Convidados acessam `/g/:publicSlug` sem login.
13. Convidados filtram e ordenam presentes por categoria, faixa, status e
    prioridade.
14. Em listas de confraternização, convidados reservam vagas de itens para levar
    até atingir o total configurado pelo administrador.
15. Em listas de presentes, administradores podem cadastrar presentes comuns ou
    financeiros com meta, valor cheio ou contribuição em grupo.
16. Convidados reservam presentes/itens disponíveis informando nome e contato
    opcional.
17. Convidados contribuem em presentes financeiros informando nome, contato
    opcional e valor combinado.
18. A reserva atualiza o status para **Reservado**, **Completo** ou **Meta
    completa**.
19. A página de suporte coleta mensagens em formulário próprio com limite de
    caracteres.

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
- Migration `202606160002_activity_and_support.sql` criada para histórico e
  suporte; precisa ser aplicada no Supabase antes dos testes finais em produção.
- Migration `202606180001_list_kinds_and_potluck.sql` criada para tipos de lista,
  quantidade por item e múltiplas reservas por item em confraternizações.
- Migration `202606180002_financial_gifts.sql` criada para presentes financeiros,
  metas e contribuições registradas por reserva.

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
- Escolher tipo da lista na criação: presentes ou confraternização.
- Editar categorias e faixas de preço por lista.
- Ligar ou desligar categorias e faixas de preço por lista.
- Usar categorias específicas e esconder preço/link/prioridade em listas de
  confraternização.
- Exibir resumo por lista: reservados, disponíveis e progresso.
- Adicionar presentes por modal.
- Editar presentes por modal.
- Adicionar presente financeiro com meta obrigatória e modo de contribuição por
  valor cheio ou em grupo.
- Registrar contribuições em presentes financeiros até completar a meta.
- Adicionar itens de confraternização com total de reservas por item.
- Pesquisar presentes dentro da lista aberta.
- Preview lateral ao adicionar ou editar presente.
- Exibir status, prioridade, desconto, faixa de preço e link do presente.
- Liberar reserva pela gestão da lista.
- Exibir histórico de atividade da lista.
- Abrir modal de compartilhamento na lista escolhida.
- Copiar/compartilhar link público da visão do convidado.
- Acessar visão do convidado em tela separada.
- Filtrar e ordenar presentes na visão do convidado.
- Reservar presente sem login com nome e contato opcional.
- Permitir múltiplas reservas no mesmo item de confraternização até atingir o
  total configurado.
- Bloquear nova reserva para presente já reservado.
- Bloquear nova reserva de item de confraternização quando o total configurado
  for atingido.
- Login/cadastro por e-mail e senha.
- Login com Google no app.
- Menu de conta com logout, dados do usuário e edição de conta.
- Dark mode com alternância no header.
- Página de suporte com formulário em tela, limite de caracteres e fallback
  local quando o Supabase não está configurado.
- Manter a Home focada no fluxo operacional de criação e acesso às listas.
- Concentrar os blocos institucionais na página **Sobre**.

## Ideias Dos Protótipos Ainda Abertas

- Estados mais claros durante a reserva: processando, confirmado e erro.
- Melhorar a tela de gerenciamento com atalhos para presentes recentes e
  reservas recentes.
- Criar uma forma simples de consultar mensagens de suporte recebidas.
- Levar imagens de presentes para Supabase Storage quando o app sair do uso
  experimental.

## Fora do escopo do MVP

- Pagamento, carrinho ou checkout.
- Integração real com lojas.
- Backend próprio complexo.
- Painel administrativo avançado.
- Notificações por e-mail/SMS.
- Controle financeiro real, carteira, cobrança ou repasse.

## Próximos passos recomendados

- Aplicar `supabase/migrations/202606160002_activity_and_support.sql` no
  Supabase.
- Aplicar `supabase/migrations/202606180001_list_kinds_and_potluck.sql` no
  Supabase.
- Aplicar `supabase/migrations/202606180002_financial_gifts.sql` no Supabase.
- Testar em produção: suporte, histórico, criação/edição de presente, reserva
  pública e liberação de reserva.
- Definir domínio final e revisar URLs de redirect do Supabase/Google.
- Manter RPC direto para reserva por enquanto e reavaliar Edge Function quando
  houver notificação, captcha ou integração externa.
- Decidir se imagens dos presentes passam para Supabase Storage.

## Melhor frente agora

A melhor frente é fechar a estabilização de produção: aplicar as novas migrations,
rodar um teste completo em ambiente publicado e resolver domínio/redirects. Depois
disso, vale atacar Storage para imagens, páginas legais simples e observabilidade
básica.
