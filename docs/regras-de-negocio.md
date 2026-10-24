# Regras de negócio

## Tipos de lista (`list_kind`)

Configurados em `src/utils/listTypes.ts` (textos e o que aparece no formulário).

| | Lista de presentes (`gift`) | Confraternização (`potluck`) |
| --- | --- | --- |
| Para quê | convidados reservam presentes | convidados dizem o que vão levar |
| Eventos | Aniversário, Casamento, Chá de bebê, Formatura, Casa nova, Outro | São João, Confraternização, Churrasco, Natal, Ano novo, Outro |
| Categorias padrão | Cozinha, Decoração, Casa | Pratos típicos, Bebidas, Descartáveis, Sobremesas, Apoio, Outros |
| Faixas de preço | Até R$100 / 100–300 / 300–700 / Acima de 700 | desligadas |
| Imagem, link, prioridade, desconto | sim | não |
| Quantidade por item | sempre 1 | 1 a 99 ("total de reservas") |
| Presente financeiro | sim | não |
| Progresso | presentes completos / total de presentes | vagas preenchidas / total de vagas |

O tipo só pode ser trocado em "Editar lista" enquanto a lista estiver vazia.

## Tipos de presente (`gift_kind`), só em listas de presentes

- **Comum (`physical`):** uma pessoa reserva; o item fica "Reservado".
- **Financeiro (`financial`):** tem meta (`target_amount`, obrigatória > 0).
  - `full` (valor cheio): uma pessoa fecha o valor restante inteiro.
  - `shared` (em grupo): cada pessoa informa um valor até o que falta; completa quando a soma
    atinge a meta.
  - Não há pagamento: é só registro de compromisso. Valores aparecem arredondados ao real.

## Disponibilidade (`src/utils/gifts.ts`, espelhada no SQL)

- Físico: completo quando `reservas >= quantity`.
- Financeiro: completo quando `meta > 0` e `soma das contribuições >= meta`.
- Editar presente: não permite reduzir a quantidade abaixo das reservas já feitas, nem a meta
  abaixo do já contribuído.

## Reserva pelo convidado

- Sem login. Nome obrigatório; telefone ou e-mail opcional.
- O convidado não consegue desfazer a própria reserva; só o dono libera.
- Nome até 80 caracteres, contato até 120.
- No máximo 5 reservas por minuto por visitante (por IP). Ao estourar, o modal continua aberto
  com a mensagem "Muitas reservas em sequência. Aguarde um minuto e tente de novo."
- Não há captcha: um script que troque de IP ainda consegue reservar em massa.

## Liberar reserva (dono)

- Cada reserva aparece numa linha (nome, contato e valor) com o botão "Liberar", que remove só
  aquela pessoa ou contribuição.
- Itens com mais de uma reserva também têm "Liberar todas (N)".
- As duas ações pedem confirmação; o histórico registra quem foi liberado.

## Excluir

- Presente: botão "Excluir" no modal de edição, com confirmação; apaga as reservas dele.
- Lista: botão "Excluir lista" no modal "Editar lista", com confirmação; apaga presentes e
  reservas, e o link público para de funcionar.

## Histórico

Tipos: `list_created`, `list_updated`, `options_updated`, `gift_added`, `gift_updated`,
`gift_deleted`, `gift_reserved`, `reservation_released`. Guarda os 60 mais recentes; a tela
mostra 8. As mensagens usam o nome do item, sem "Presente".

## Conta

E-mail e senha, ou Google. "Esqueci minha senha" envia um link que volta para `/login` e abre
a tela de nova senha (evento `PASSWORD_RECOVERY` do Supabase).

## O que **não** existe hoje

- Duplicar lista; reordenar presentes (`sort_order` existe mas não é usado).
- Tornar lista privada (`is_public` sempre true).
- Notificar o dono quando alguém reserva.
- Página de privacidade (o link do rodapé é só texto).
