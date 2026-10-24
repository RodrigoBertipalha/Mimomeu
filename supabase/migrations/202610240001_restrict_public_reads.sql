-- Convidados leem listas apenas pela RPC get_public_wishlist (security definer).
-- As politicas abaixo permitiam que qualquer visitante listasse todas as listas e presentes.
drop policy if exists "wishlists_public_read" on public.wishlists;
drop policy if exists "gifts_public_read" on public.gifts;
