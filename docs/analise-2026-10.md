# Análise e testes do Mimo Meu (24/10/2026)

## Status da rodada 1 (concluída em 24/10/2026)

Todos os itens foram implementados e retestados no Chrome:

| Item | Status |
| --- | --- |
| S1 | Migration `202610240001_restrict_public_reads.sql` aplicada; leitura anônima da tabela bloqueada (testado) |
| B1 a B11, B13 | Corrigidos e confirmados no reteste |
| B12 | Diagnóstico corrigido: o `vite.config.js` já aceitava todos os nomes. Só os textos de ajuda foram ajustados |
| F1 | Excluir presente e excluir lista, com confirmação dentro do app |
| F3 | "Esqueci minha senha" e tela de nova senha. A tela final, que abre pelo link do e-mail, precisa ser testada com um e-mail real |
| R1 a R4 | Removidos: Edge Function, modo localStorage, flags de compatibilidade, `vite-dev.err`, faixas de preço na confraternização |
| Extra | O aviso "Lista criada." não sumia (timer cancelado); corrigido |
| Extra | A página do convidado não baixa mais todas as listas do dono quando ele está logado |
| Extra | Erros de tipo antigos do `wishlistRepository.ts` resolvidos (`tsc` passa limpo) |

## Status da rodada 2

| Item | Status |
| --- | --- |
| S2 | Feito (25/10): limites de tamanho e 5 reservas por minuto por IP, migration `202610250001` aplicada e testada. Captcha fica para depois |
| F2 | Feito (25/10): liberar por pessoa, "Liberar todas (N)", confirmação nas duas ações e histórico com o nome |
| P1 | Feito (25/10): fotos novas no Storage, comprimidas para 1200 px em WebP (teste: 3000×3000 virou 29 KB), botão "Remover foto", limpeza ao trocar, remover ou excluir. Migrations `202610250002` e `202610250003` |
| RF1 | Feito (25/10): `WishlistProvider` com cache compartilhado; Home não busca de novo, Minhas listas e Detalhe abrem na hora e se atualizam em segundo plano |

Rodada 2 concluída em 25/10/2026. Próximos candidatos (rodada 3): RF3 (layout no celular),
F4 (quantidade em lista de presentes), F8 (esconder quem reservou), F5 (foto pelo link) e
F7 (aviso por e-mail ao dono).

Leitura completa do código (cerca de 7,4 mil linhas, 5 migrations) e teste no Chrome de 34 fluxos
contra o Supabase de produção. Build e lint passam sem erros. Detalhe de cada fluxo em
[fluxos.md](fluxos.md).

**Esforço:** P = horas · M = 1 a 2 dias · G = 3 dias ou mais.

## Resumo

O núcleo do produto funciona e está bem pensado. A reserva é transacional no banco, com trava de
linha, as validações do servidor seguram os casos maliciosos que testei e os três modelos (presente
comum, presente financeiro e confraternização com vagas) funcionam de ponta a ponta. Os problemas
estão em quatro frentes:

1. **Privacidade:** qualquer pessoa lista todas as listas de todos os usuários pela API.
2. **Fotos no banco em base64:** uma única foto já deixa a página com 1,7 MB e 2,5 s de carga.
3. **Funções básicas ausentes:** excluir presente ou lista, liberar a reserva de uma pessoa só,
   recuperar senha.
4. **Acabamento:** avisos fora da tela, textos e rótulos errados, dinheiro arredondado,
   data em formato ISO.

---

## 1. Corrigir (bugs confirmados)

| ID | Problema | Evidência | Correção | Esforço |
| --- | --- | --- | --- | --- |
| S1 | **Qualquer visitante lê todas as listas** pela API: 11 listas de 4 donos, com `owner_id`, histórico e nomes dos convidados | `GET /rest/v1/wishlists` com a chave pública | Remover as políticas `wishlists_public_read` e `gifts_public_read`. A página do convidado usa RPC `security definer`, que não depende delas | P |
| B1 | Editor de categorias: ao editar uma existente não dá para digitar espaço ("CozinhaGourmet"), e apagar o texto remove a categoria | testado | Em `ListOptionsEditor`, só limpar (`trim` e remover vazios) no `onBlur`, não a cada tecla | P |
| B2 | Avisos e erros aparecem no **topo da página**, fora da tela: "já reservado" do convidado (3.400 px acima) e "Reserva liberada" do dono (1.177 px acima). Depois do erro a lista do convidado não recarrega | testado | Mostrar como toast fixo e recarregar a lista quando a reserva falhar | P |
| B3 | Contribuição financeira mostra "Reserva confirmada… Você reservou: Geladeira" | testado | Texto próprio: "Contribuição registrada" | P |
| B4 | Dinheiro sem centavos: R$ 850,50 aparece como R$ 851, e "Faltam R$ 3.350" soma R$ 4.201 numa meta de R$ 4.200 | testado | `formatMoney`: mostrar centavos quando existirem | P |
| B5 | Home rotula as listas da nuvem como "Listas locais / Criadas neste navegador" | testado | Trocar para "Suas listas" | P |
| B6 | Quem entra com Google aparece como o começo do e-mail ("belalalatrix") | `user_metadata` tem `full_name` e `avatar_url` | Usar `display_name ?? full_name ?? name` e mostrar o avatar | P |
| B7 | Trocar o tipo de uma lista com itens deixa tudo inconsistente: a Carne fica "Qtd: 1" com 3 reservas e as categorias voltam ao padrão | testado | Bloquear a troca de tipo depois de criada (ou só com a lista vazia) | P |
| B8 | Adicionar presente: o formulário limpa e diz "adicionado" **antes** de salvar, sem loading e por cerca de 3 s. Se der erro, o que foi digitado se perde; dá para clicar duas vezes | testado | `await` no submit, botão desabilitado com "Salvando…", limpar só depois do sucesso | P |
| B9 | Selos (Disponível, Alta prioridade, Com desconto) ficam ilegíveis sobre fotos claras | print | Fundo escuro sólido ou selos fora da foto | P |
| B10 | Datas cruas "2026-12-12" na gestão, nos cards e na mensagem do WhatsApp | testado | Formatar `dd/mm/aaaa` ou "12 de dezembro" | P |
| B11 | A **mensagem do anfitrião** e a data **não aparecem para o convidado**, embora a mensagem vá no WhatsApp | testado | Exibir mensagem, data e tipo do evento no topo de `/g/:slug` | P |
| B12 | ~~Nome da variável incompatível~~. **Diagnóstico errado:** o `vite.config.js` já converte todos os nomes. Só as mensagens de ajuda na tela citavam o nome antigo | código | Mensagens ajustadas | P |
| B13 | Menores: ESC não fecha os modais do convidado; o histórico diz "Presente…" mesmo em confraternização; a ordem dos presentes na gestão não é fixa (query sem `order`) | testado e código | Ajustes pontuais | P |

## 2. Evoluir (faltam e fazem sentido)

| ID | O quê | Por quê | Esforço |
| --- | --- | --- | --- |
| F1 | **Excluir presente e excluir lista**, com confirmação | Hoje não há como apagar nada: um presente errado fica para sempre. As políticas de delete já existem no banco | P |
| F2 | **Liberar a reserva de uma pessoa só**, com confirmação | "Liberar" apaga todas as reservas do item. Numa confraternização com 3 pessoas na carne, ou numa vaquinha com 3 contribuições, é tudo ou nada | M |
| F3 | **Esqueci minha senha** | Quem se cadastrou por e-mail e esqueceu a senha perde o acesso às listas | P |
| P1 | **Fotos no Supabase Storage**, comprimidas no navegador (cerca de 1200 px, WebP) | Página pública de 1,7 MB e 2,5 s com uma foto; 20 fotos de celular passariam de 20 MB. Hoje a gestão e a Home baixam todas as fotos de todas as listas | M |
| S2 | Proteção contra abuso na reserva: limite de tamanho de nome e contato (aceitou 5.000 caracteres) e limite de reservas por minuto ou captcha | Um visitante pode preencher a lista inteira com nomes falsos | P (limites) / M (captcha) |
| F4 | Quantidade em lista de presentes (ex.: "6 pratos") | Hoje é sempre 1; a confraternização já tem essa lógica pronta | P |
| F5 | Colar link de imagem (ou puxar a foto do link do produto) | Mais prático que baixar a foto e subir | M |
| F6 | Convidado cancelar a própria reserva (link mágico ou código) | Hoje só o dono desfaz | M |
| F7 | Avisar o dono quando alguém reservar (e-mail) | Hoje ele precisa entrar para ver | M (Edge Function) |
| F8 | Opção "esconder quem reservou" para os outros convidados | Os nomes de quem reservou ficam públicos na página da lista | P |
| F9 | Reordenar presentes (`sort_order` já existe) | Destacar os mais desejados | M |
| F10 | Página de privacidade e termos (o rodapé tem "Privacidade" sem link) | O app guarda nome e contato de terceiros | P |

## 3. Remover (código morto ou que atrapalha)

| ID | O quê | Por quê | Esforço |
| --- | --- | --- | --- |
| R1 | Edge Function `supabase/functions/reserve-gift` | Não é usada, está desatualizada (não envia `contribution_amount`) e confunde | P |
| R2 | Modo offline em localStorage (`utils/storage.ts`, reserva local no hook, suporte local) | É inalcançável: `ProtectedRoute` bloqueia a gestão sem Supabase. São cerca de 250 linhas de caminhos paralelos | P |
| R3 | Flags de "coluna não existe" em `wishlistRepository.ts` | Todas as migrations estão aplicadas; são cerca de 150 linhas de fallback | P |
| R4 | `vite-dev.err` versionado; checkbox "Usar faixas de preço" em confraternização (que não mostra preço) | Ruído | P |

## 4. Refazer (estrutura)

| ID | O quê | Por quê | Esforço |
| --- | --- | --- | --- |
| RF1 | Camada de dados com cache compartilhado (React Query ou um Context) | Cada página chama `useWishlist()` e baixa **todas** as listas com presentes e reservas, inclusive a Home. Cada ação faz 3 ou 4 idas ao servidor e recarrega tudo | M |
| RF2 | Histórico em tabela própria (`activities`) | Hoje é um JSON regravado inteiro pelo navegador; ações simultâneas do dono e de convidados podem se sobrescrever | M |
| RF3 | Layout do celular: filtros recolhíveis no convidado, cards compactos sem foto na confraternização, resumo menor na gestão | O primeiro presente só aparece depois de 948 px (convidado) e 1.379 px (gestão); cada item de confraternização ocupa uma tela inteira | M |
| RF4 | Dividir o bundle (554 KB num único JS) | Carregar `/g/:slug` sem o código da gestão | P |

## 5. O que está bom e deve ficar

- RPC `reserve_public_gift` com `for update` e validação completa no servidor.
- Os três modelos de lista e presente, com textos adaptados a cada um (`listTypes.ts`).
- Prévia lateral ao cadastrar, rascunho do presente, filtros e ordenação para o convidado.
- Compartilhamento por WhatsApp e e-mail, dark mode, página de suporte gravando no banco.
- Visual consistente e sem quebra de largura no celular.

## Operação

- **Plano gratuito do Supabase pausa por inatividade** (aconteceu hoje). Antes de divulgar,
  considere o plano Pro ou um ping periódico.
- `docs/production-checklist.md` está desatualizado: as migrations 0002, 180001 e 180002 **já
  estão aplicadas**.
- Mensagens de suporte só são lidas pelo painel do Supabase.

## Plano sugerido

1. **Rodada 1, estabilizar (cerca de 2 dias):** S1, B1 a B12, F1, F3, R1 a R4.
2. **Rodada 2, escalar:** P1 (Storage), F2, S2, RF1.
3. **Rodada 3, encantar:** RF3 (celular), F4, F8, F5, F7.

## Dados de teste criados

Na conta Google `belalalatrix@gmail.com`:

- **Casamento Ana & Pedro** (`/g/casamento-ana-pedro-a21e1bb9`): 16 presentes com fotos
  ilustrativas, 3 financeiros, reservas e contribuições de exemplo.
- **Churrasco de fim de ano** (`/g/churrasco-de-fim-de-ano-565a7d6c`): 12 itens com vagas,
  10 de 24 combinados.
- 1 mensagem em `support_messages` marcada "[TESTE AUTOMATIZADO - pode apagar]".

As reservas de teste abusivas (nome de 5.000 caracteres, valor exagerado) foram apagadas, e as
entradas correspondentes foram removidas do histórico.
