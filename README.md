# fmdata

Dashboard do histórico do Last.fm — projeto final de frontend.

Transforma o histórico de reproduções (scrobbles) de um utilizador numa análise pessoal: quem ouves mais, o que ouves mais, quando ouves e que género domina. Os dados vêm da API [fmdata](https://fmdata-api.onrender.com/docs); o projeto não tem backend.

## Duas experiências

| Rota | O que mostra |
|---|---|
| `/` — Dashboard | Totais, Top 20 artistas, Top 10 músicas, Top 8 álbuns, gráfico das 24 horas (UTC), género mais ouvido e a análise única. Cada secção tem o seu filtro de período, no cabeçalho: tudo, 30, 14, 7 dias ou 24 horas. |
| `/artistas/[nome]` — Página do artista | Cabeçalho (foto, tags, links, biografia), estatísticas, Top 10 músicas, álbuns ("Ouviste X de Y faixas"), reproduções por mês, relógio das 24 horas, últimas 10 reproduções e artistas semelhantes. Sempre com o histórico todo. |

**Análise única:** *Que artistas ouves só a certas horas do dia?* — artistas com pelo menos 10 reproduções que juntam 70% ou mais num só momento do dia (madrugada, manhã, tarde ou noite, em UTC).

## Como correr

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Da primeira vez o histórico pode demorar até um minuto: o servidor da API adormece quando não é usado.

Outros comandos:

```bash
npm run build && npm start   # versão de produção
npm run lint                 # eslint
npx tsc --noEmit             # verificação de tipos
```

## Testes

```bash
npx tsx scripts/testar-api.ts     # chama a API real e grava scripts/amostra.json
npx tsx scripts/testar-lib.ts     # testa as funções puras de lib/ (precisa da amostra)
npx tsx scripts/testar-store.ts   # testa cache, deduplicação, persistência e migração do store
```

## Arquitetura

```
dados da API -> funções puras em lib/ -> store Zustand -> hooks -> componentes
```

```
src/
├── app/            Rotas (App Router): layout, / e /artistas/[nome]; globals.css com o design system
├── components/
│   ├── dashboard/  Secções do dashboard e o filtro de período
│   ├── artista/    Secções da página do artista
│   ├── graficos/   Gráficos Recharts (horas e meses)
│   └── ui/         Peças reutilizáveis: Bloco, Faixa, Capa, estados de carregar/erro/vazio
├── hooks/          Ligam o store aos componentes (useScrobbles, useFiltrados, useArtistInfo…)
├── lib/            Funções puras: dates, filters, stats, artist, analise, rotas, formatar
├── services/       api.ts — o único sítio que faz fetch; armazemLocal.ts — cache do histórico em IndexedDB
├── store/          useStore.ts — Zustand
└── types/          Tipos da API e da aplicação
```

### Decisões principais

- **Funções puras em `lib/`.** Toda a transformação de dados vive aqui: sem `fetch`, sem store e sem `Date.now()`. Entram scrobbles, sai o resultado. Por isso são fáceis de testar (`scripts/testar-lib.ts`).
- **Os períodos contam a partir da última reprodução**, não da hora atual. "24 horas" são as 24 horas antes do scrobble mais recente.
- **Store Zustand com quatro papéis:**
  - *estado global* — o período de cada secção do dashboard (`periodo` + `excecoes`), lido com `usePeriodo` / `usePeriodoDasSeccoes`;
  - *cache* — cada pedido fica num `Entry<T>` (`data`, `status`, `error`); com resposta, não se volta a pedir;
  - *persistência* — `persist` em localStorage com `skipHydration` (a reidratação é feita no cliente, em `useHydrated`);
  - *deduplicação* — pedidos iguais em simultâneo partilham a mesma promessa.
- **Onde se guarda o quê.** No localStorage (via `persist`): o período e os perfis (artistas, álbuns, fotos). O histórico completo (~51 700 scrobbles, ~25 MB) não cabe no localStorage (~5 MB), por isso vai para o IndexedDB (`services/armazemLocal.ts`) e vale durante 1 hora: um refresh não volta a pedir `/scrobbles`.
- **Links de artista com `encodeURIComponent`**, e o parâmetro da rota lido com `decodeURIComponent` (`lib/rotas.ts`).
- **Design.** Vermelho e branco, títulos em Archivo larga e itálica, ícones [Solar](https://github.com/saoudi-h/solar-icons) (sem emojis). Responsivo de 390 px a ecrãs largos.

## Tecnologias

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zustand 5 · Recharts 3 · `@solar-icons/react`

## Créditos

Dados: Last.fm, através da API fmdata. Fotos de artistas: Wikimedia Commons.
