# Fluxos e casos de uso

Status atual depois das rodadas 1 e 2 (testes no Chrome contra o Supabase de produção em
24 e 25/10/2026): ✅ funciona · ⚠️ funciona com ressalva · ❌ não existe.
Os códigos (B1, F2...) apontam para [analise-2026-10.md](analise-2026-10.md).

## Dono da lista (logado)

| # | Fluxo | Onde | Status |
| --- | --- | --- | --- |
| 1 | Entrar com Google | `/login` → AuthProvider.signInWithGoogle | ✅ nome e foto do Google no menu (B6) |
| 2 | Entrar ou criar conta por e-mail | `/login` | ✅ pelo código; não testado (usamos Google) |
| 3 | Esqueci minha senha | `/login?mode=forgot` | ✅ pedido do link testado; ⚠️ a tela de nova senha (aberta pelo link do e-mail) ainda precisa de teste com e-mail real (F3) |
| 4 | Criar lista de presentes | `/list?new=1` → ListForm → createRemoteWishlist | ✅ |
| 5 | Criar confraternização | idem, tipo "Confraternização" | ✅ |
| 6 | Adicionar categoria nova | ListOptionsEditor | ✅ |
| 7 | Editar categoria existente | ListOptionsEditor | ✅ aceita espaço e não some ao apagar (B1) |
| 8 | Editar dados da lista | "Editar lista" → updateRemoteWishlist | ✅ |
| 9 | Trocar o tipo da lista | "Editar lista" | ✅ só com a lista vazia (B7) |
| 10 | Adicionar presente com foto | GiftForm → Storage + addRemoteGift | ✅ "Salvando…", sem duplicar (B8); foto comprimida no Storage (P1) |
| 11 | Trocar ou remover a foto | GiftForm | ✅ arquivo antigo apagado do Storage (P1) |
| 12 | Validar link do produto | GiftForm.isValidUrl | ✅ |
| 13 | Adicionar presente financeiro (meta obrigatória) | GiftForm | ✅ |
| 14 | Adicionar item de confraternização com quantidade | GiftForm (`quantity_required`) | ✅ |
| 15 | Editar presente | GiftForm → updateRemoteGift | ✅ |
| 16 | Impedir quantidade menor que as reservas | GiftForm | ✅ |
| 17 | Excluir presente | Modal de edição → ConfirmDialog | ✅ apaga reservas e foto (F1) |
| 18 | Excluir lista | "Editar lista" → ConfirmDialog | ✅ volta para Minhas listas (F1); ⚠️ apagar as fotos junto não foi testado |
| 19 | Pesquisar presente na gestão | ListDetailPage | ✅ |
| 20 | Ver quem reservou, contato e valor | GiftList (modo dono) | ✅ uma linha por pessoa |
| 21 | Liberar a reserva de uma pessoa | GiftList → ConfirmDialog → deleteRemoteReservation | ✅ com confirmação e registro no histórico (F2) |
| 22 | Liberar todas as reservas de um item | "Liberar todas (N)" | ✅ com confirmação (F2) |
| 23 | Avisos de sucesso e erro | Toast | ✅ visíveis na tela e somem sozinhos (B2) |
| 24 | Histórico da lista | ActivityTimeline | ✅ mostra os 8 últimos |
| 25 | Compartilhar (copiar link, WhatsApp, e-mail) | ShareCard | ✅ data por extenso (B10) |
| 26 | Navegar entre Home, Minhas listas e Detalhe | WishlistProvider | ✅ abre na hora e atualiza em segundo plano (RF1) |
| 27 | Editar nome, e-mail e senha da conta | AccountMenu → "Minha conta" | ✅ pelo código; não testado |
| 28 | Fechar modais com ESC | Modal, ReserveGiftModal | ✅ (B13) |

## Convidado (sem login)

| # | Fluxo | Status |
| --- | --- | --- |
| 29 | Abrir a lista pelo link | ✅ mostra tipo, data e mensagem do anfitrião (B11) |
| 30 | Filtrar por categoria, faixa e status; ordenar | ✅ |
| 31 | Reservar presente comum | ✅ |
| 32 | Reservar algo que outra pessoa acabou de reservar | ✅ erro visível e lista atualizada (B2) |
| 33 | Contribuir em presente em grupo | ✅ "Contribuição registrada!" com o valor; centavos corretos (B3, B4) |
| 34 | Contribuir com valor cheio | ✅ |
| 35 | Combinar item de confraternização até o limite | ✅ |
| 36 | Muitas reservas seguidas | ✅ a 6ª no mesmo minuto é recusada com aviso; modal continua aberto (S2) |
| 37 | Cancelar a própria reserva | ❌ não existe (F6) |
| 38 | Enviar mensagem de suporte | ✅ |

## Regras do servidor testadas direto na RPC `reserve_public_gift`

| Caso | Resultado |
| --- | --- |
| Presente já reservado | ✅ `already_reserved` |
| Nome vazio ou só espaços | ✅ `guest_required` |
| Nome com mais de 80 caracteres | ✅ `guest_too_long` |
| Contato com mais de 120 caracteres | ✅ `contact_too_long` |
| 6ª reserva em menos de 1 minuto pelo mesmo IP | ✅ `rate_limited` |
| Contribuição negativa | ✅ `invalid_amount` |
| Contribuição acima do que falta | ✅ grava só o restante |
| Lista inexistente | ✅ `not_found` |

## Segurança testada pela API

| Caso | Resultado |
| --- | --- |
| Visitante sem login listando todas as listas | ✅ bloqueado (S1) |
| Página pública pela RPC | ✅ continua funcionando |
| Foto pública pelo link | ✅ abre sem login |

## Celular (390 px)

Sem rolagem horizontal ✅. ⚠️ O primeiro presente só aparece depois de rolar cerca de 950 px
no convidado e 1.380 px na gestão, e cada card de confraternização ocupa uma tela inteira (RF3,
rodada 3).
