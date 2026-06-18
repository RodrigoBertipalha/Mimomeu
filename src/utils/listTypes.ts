import type { WishlistKind } from '../types/wishlist'

export const DEFAULT_WISHLIST_KIND: WishlistKind = 'gift'

type ListTypeConfig = {
  name: string
  description: string
  eventLabel: string
  eventPlaceholder: string
  eventTypes: string[]
  defaultEventType: string
  itemSingular: string
  itemPlural: string
  itemNameLabel: string
  itemNamePlaceholder: string
  itemDescriptionLabel: string
  itemDescriptionPlaceholder: string
  itemImageLabel: string
  itemImageEmptyLabel: string
  addItemLabel: string
  editItemLabel: string
  itemsKicker: string
  itemsHeading: string
  managementDescription: string
  publicDescription: string
  searchPlaceholder: string
  categoryGroupLabel: string
  categoryAddLabel: string
  categoryPlaceholder: string
  optionsTitle: string
  optionsDescription: string
  showPriceRange: boolean
  showPriority: boolean
  showDiscount: boolean
  showProductLink: boolean
  showImage: boolean
  showQuantity: boolean
  quantityLabel: string
  quantityHelp: string
  availableLabel: string
  reservedLabel: string
  unavailableLabel: string
  reservedStatLabel: string
  availableStatLabel: string
  reservedStatDescription: string
  availableStatDescription: string
  progressLabel: string
  progressUnit: string
  reserveActionLabel: string
  reserveModalKicker: string
  reserveModalTitle: string
  reserveModalDescription: string
  reserveConfirmLabel: string
  reserveSuccessTitle: string
  reserveSuccessPrefix: string
  alreadyReservedError: string
  releaseActionLabel: string
  releaseSuccessMessage: string
  shareTitle: string
  shareDescription: string
}

export const LIST_TYPE_CONFIG: Record<WishlistKind, ListTypeConfig> = {
  gift: {
    name: 'Lista de presentes',
    description: 'Convidados escolhem e reservam presentes para o evento.',
    eventLabel: 'Tipo de evento',
    eventPlaceholder: 'Selecione uma opção',
    eventTypes: [
      'Aniversário',
      'Casamento',
      'Chá de bebê',
      'Formatura',
      'Casa nova',
      'Outro',
    ],
    defaultEventType: '',
    itemSingular: 'presente',
    itemPlural: 'presentes',
    itemNameLabel: 'Nome do presente',
    itemNamePlaceholder: 'Ex: Tênis de corrida',
    itemDescriptionLabel: 'Descrição',
    itemDescriptionPlaceholder: 'Conte detalhes como tamanho, cor ou preferência.',
    itemImageLabel: 'Imagem do presente',
    itemImageEmptyLabel: 'Toque para carregar ou arraste uma foto',
    addItemLabel: 'Adicionar presente',
    editItemLabel: 'Salvar presente',
    itemsKicker: 'Presentes',
    itemsHeading: 'Itens da lista',
    managementDescription:
      'Acompanhe reservas, edite os dados da lista e gerencie os presentes cadastrados.',
    publicDescription:
      'Estamos muito felizes em compartilhar esse momento com você. Escolha um presente da lista de {ownerNames} para celebrar com carinho.',
    searchPlaceholder: 'Pesquisar presente...',
    categoryGroupLabel: 'Categorias',
    categoryAddLabel: 'Adicionar',
    categoryPlaceholder: 'Nova categoria',
    optionsTitle: 'Opções da lista',
    optionsDescription: 'Categorias e faixas usadas ao cadastrar presentes.',
    showPriceRange: true,
    showPriority: true,
    showDiscount: true,
    showProductLink: true,
    showImage: true,
    showQuantity: false,
    quantityLabel: 'Quantidade',
    quantityHelp: 'Quantidade disponível para reserva.',
    availableLabel: 'Disponível',
    reservedLabel: 'Reservado',
    unavailableLabel: 'Já reservado',
    reservedStatLabel: 'Reservados',
    availableStatLabel: 'Disponíveis',
    reservedStatDescription: 'Presentes já escolhidos',
    availableStatDescription: 'Presentes ainda livres',
    progressLabel: 'Progresso da lista',
    progressUnit: 'reservados',
    reserveActionLabel: 'Reservar presente',
    reserveModalKicker: 'Reserva de presente',
    reserveModalTitle: 'Confirmar reserva',
    reserveModalDescription:
      'Informe seus dados para que o anfitrião saiba quem reservou este presente.',
    reserveConfirmLabel: 'Confirmar reserva',
    reserveSuccessTitle: 'Reserva confirmada com sucesso!',
    reserveSuccessPrefix: 'Você reservou:',
    alreadyReservedError: 'Este presente já foi reservado.',
    releaseActionLabel: 'Liberar reserva',
    releaseSuccessMessage: 'Reserva liberada.',
    shareTitle: 'Sua lista está pronta!',
    shareDescription:
      'Agora é só enviar para seus convidados e começar a receber mimos inesquecíveis.',
  },
  potluck: {
    name: 'Confraternização',
    description:
      'Convidados escolhem o que vão levar, com vagas por item combinadas antes.',
    eventLabel: 'Ocasião',
    eventPlaceholder: 'Selecione uma ocasião',
    eventTypes: [
      'São João',
      'Confraternização',
      'Churrasco',
      'Natal',
      'Ano novo',
      'Outro',
    ],
    defaultEventType: 'Confraternização',
    itemSingular: 'item',
    itemPlural: 'itens',
    itemNameLabel: 'Nome do item',
    itemNamePlaceholder: 'Ex: Arroz doce',
    itemDescriptionLabel: 'Observação',
    itemDescriptionPlaceholder: 'Ex: travessa média, sem amendoim, levar pronto.',
    itemImageLabel: 'Imagem do item',
    itemImageEmptyLabel: 'Toque para carregar ou arraste uma foto',
    addItemLabel: 'Adicionar item',
    editItemLabel: 'Salvar item',
    itemsKicker: 'Itens para levar',
    itemsHeading: 'Combinados da lista',
    managementDescription:
      'Acompanhe quem vai levar cada item, ajuste quantidades e organize a ocasião.',
    publicDescription:
      'Combine com {ownerNames} o que você vai levar. Escolha um item disponível e confirme sua participação na lista.',
    searchPlaceholder: 'Pesquisar item...',
    categoryGroupLabel: 'Categorias de itens',
    categoryAddLabel: 'Adicionar',
    categoryPlaceholder: 'Nova categoria',
    optionsTitle: 'Opções da confraternização',
    optionsDescription: 'Categorias usadas ao cadastrar itens para levar.',
    showPriceRange: false,
    showPriority: false,
    showDiscount: false,
    showProductLink: false,
    showImage: false,
    showQuantity: true,
    quantityLabel: 'Total de reservas',
    quantityHelp: 'Quantas pessoas podem combinar de levar este mesmo item.',
    availableLabel: 'Ainda precisa',
    reservedLabel: 'Completo',
    unavailableLabel: 'Completo',
    reservedStatLabel: 'Combinados',
    availableStatLabel: 'Faltando',
    reservedStatDescription: 'Reservas já confirmadas',
    availableStatDescription: 'Vagas ainda abertas',
    progressLabel: 'Progresso da confraternização',
    progressUnit: 'combinados',
    reserveActionLabel: 'Vou levar',
    reserveModalKicker: 'Item da confraternização',
    reserveModalTitle: 'Confirmar que vou levar',
    reserveModalDescription:
      'Informe seus dados para que os administradores saibam quem vai levar este item.',
    reserveConfirmLabel: 'Confirmar que vou levar',
    reserveSuccessTitle: 'Combinado confirmado!',
    reserveSuccessPrefix: 'Você vai levar:',
    alreadyReservedError: 'Este item já completou todas as reservas.',
    releaseActionLabel: 'Liberar reservas',
    releaseSuccessMessage: 'Reservas liberadas.',
    shareTitle: 'Sua confraternização está pronta!',
    shareDescription:
      'Agora é só enviar para os convidados e acompanhar quem vai levar cada item.',
  },
}

export function normalizeWishlistKind(value: unknown): WishlistKind {
  return value === 'potluck' ? 'potluck' : DEFAULT_WISHLIST_KIND
}

export function getListTypeConfig(value: unknown) {
  return LIST_TYPE_CONFIG[normalizeWishlistKind(value)]
}
