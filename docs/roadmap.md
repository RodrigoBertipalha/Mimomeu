# Roadmap - MVP Mimo Meu

Este documento descreve o estado atual do MVP e o fluxo que deve guiar as
próximas melhorias.

## Fluxo atual

1. A pessoa acessa a Home.
2. Se quiser criar ou gerenciar listas, entra ou cria conta.
3. Em **Minhas listas**, cria uma nova lista ou escolhe uma lista existente.
4. Ao abrir uma lista, vê o resumo geral com reservados, disponíveis e progresso.
5. Na mesma tela, pesquisa, adiciona ou edita presentes.
6. O botão **Editar lista** abre um modal para alterar os dados do evento.
7. O botão **Compartilhar** abre um modal com link público, WhatsApp e e-mail.
8. O botão **Ver como convidado** abre a tela pública da lista.
9. Convidados acessam `/g/:publicSlug` sem login.
10. Convidados reservam presentes disponíveis informando nome e contato opcional.
11. A reserva atualiza o status do presente para **Reservado**.

## Rotas

- `/`: tela inicial do Mimo Meu.
- `/about`: tela institucional acessada pelo link **Sobre** do footer.
- `/login`: login e cadastro.
- `/list`: visão **Minhas listas**, protegida por login.
- `/list/:listId`: detalhe e gerenciamento da lista escolhida, protegido por login.
- `/g/:publicSlug`: visão pública do convidado.
- `/list/:listId/guest`: rota de compatibilidade para pré-visualização.

## Persistência

O caminho de produção usa Supabase.

- Auth por e-mail e senha.
- Postgres para listas, presentes e reservas.
- Row Level Security para restringir gestão ao dono da lista.
- Funções SQL para leitura pública e reserva sem login.

O `localStorage` permanece apenas como fallback de desenvolvimento quando as
variáveis do Supabase não estiverem configuradas.

## Funcionalidades concluídas

- Criar múltiplas listas com usuário autenticado.
- Listar listas do usuário autenticado.
- Abrir uma lista específica por clique.
- Editar dados da lista por modal.
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
- Manter a Home focada no fluxo operacional de criação e acesso às listas.
- Concentrar os blocos institucionais na página **Sobre**.

## Fora do escopo do MVP

- Pagamento, carrinho ou checkout.
- Integração real com lojas.
- Backend próprio complexo.
- Painel administrativo avançado.
- Notificações por e-mail/SMS.
- Controle financeiro.

## Próximos passos recomendados

- Criar projeto Supabase e aplicar a migration.
- Configurar Vercel com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Testar cadastro, login, criação de lista e reserva pública em produção.
- Decidir se imagens dos presentes passam para Supabase Storage.
- Criar páginas simples de privacidade e suporte.
