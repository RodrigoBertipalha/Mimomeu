# Documentação do Mimo Meu

Ponto de partida para entender o projeto. Leia nesta ordem:

| Arquivo | Conteúdo |
| --- | --- |
| [arquitetura.md](arquitetura.md) | Stack, pastas, camadas e como os dados fluem do banco até a tela |
| [banco-de-dados.md](banco-de-dados.md) | Tabelas, colunas, RLS, funções RPC e histórico das migrations |
| [regras-de-negocio.md](regras-de-negocio.md) | Tipos de lista, tipos de presente, reservas, contribuições, histórico |
| [fluxos.md](fluxos.md) | Cada caso de uso passo a passo, com as telas e funções envolvidas |
| [ambiente.md](ambiente.md) | Como rodar localmente, variáveis de ambiente, deploy e Supabase |
| [analise-2026-10.md](analise-2026-10.md) | Relatório de análise e testes (out/2026): bugs, riscos e recomendações |

Documentos anteriores (mantidos):

- [roadmap.md](roadmap.md): visão de produto (histórico, estado de jun/2026).
- [production-checklist.md](production-checklist.md): checklist de produção (atualizado em 25/10/2026).
- [visual-identity.md](visual-identity.md): identidade visual.

## Situação em 25/10/2026

Rodadas 1 e 2 concluídas e testadas (ver [analise-2026-10.md](analise-2026-10.md)). As 9
migrations em `supabase/migrations/` estão aplicadas no banco. Os dados atuais são de teste;
o banco será resetado antes de abrir o app para mais pessoas.

## Resumo em uma frase

App React (Vite) sem backend próprio: o navegador fala direto com o Supabase (Auth + Postgres
com RLS); convidados sem login leem e reservam por duas funções SQL `security definer`.
