/**
 * lib/analise.ts — a análise única (requisito extra do enunciado).
 *
 * Pergunta: "Que artistas ouves só a certas horas do dia?"
 *
 * Porque conta como análise nova:
 *  - não se obtém com o filtro de período (o filtro diz QUANDO, em dias;
 *    isto cruza artista × momento do dia);
 *  - não é um "mais ouvido" (artista, música, álbum, género ou hora de pico);
 *  - usa só os dados que já existem (artista + data de cada audição).
 *
 * Como se calcula:
 *  1. cada audição cai num momento do dia (madrugada, manhã, tarde, noite), em UTC;
 *  2. para cada artista com audições suficientes, conta-se quanto ouve em cada momento;
 *  3. ficam os artistas em que um só momento junta a maior parte (por omissão ≥ 70%).
 *
 * Função pura: sem fetch, sem store e sem Date.now().
 * Responde ao filtro de período, porque recebe os scrobbles já filtrados.
 */
import type { Scrobble } from "@/types";
import { horaUTC, parseDataScrobble } from "./dates";
import { normalizarNome } from "./filters";

export const PERGUNTA_ANALISE = "Que artistas ouves só a certas horas do dia?";

export type MomentoDoDia = "madrugada" | "manhã" | "tarde" | "noite";

/** Momentos do dia, com as horas UTC que abrangem ([de, ate[). */
export const MOMENTOS: { momento: MomentoDoDia; de: number; ate: number }[] = [
  { momento: "madrugada", de: 0, ate: 6 },
  { momento: "manhã", de: 6, ate: 12 },
  { momento: "tarde", de: 12, ate: 18 },
  { momento: "noite", de: 18, ate: 24 },
];

/** 0–5 madrugada · 6–11 manhã · 12–17 tarde · 18–23 noite. */
export function momentoDaHora(hora: number): MomentoDoDia {
  return (MOMENTOS.find((m) => hora >= m.de && hora < m.ate) ?? MOMENTOS[0]).momento;
}

export interface ArtistaDeMomento {
  artista: string;
  momento: MomentoDoDia;
  /** % das audições do artista que caem nesse momento (0–100). */
  percentagem: number;
  /** Audições do artista nesse momento. */
  noMomento: number;
  /** Audições do artista no total (no período recebido). */
  total: number;
}

export interface OpcoesAnalise {
  /** Mínimo de audições para um artista entrar (evita "100%" com 2 audições). */
  minimoAudicoes?: number;
  /** Fração mínima num só momento para contar como "só a certas horas". */
  limiar?: number;
  /** Máximo de artistas devolvidos. */
  limite?: number;
}

/**
 * Artistas que se concentram num momento do dia, do mais concentrado para o
 * menos (em empate, o mais ouvido primeiro). Lista vazia se nenhum cumprir.
 */
export function artistasDeMomento(
  scrobbles: Scrobble[],
  { minimoAudicoes = 10, limiar = 0.7, limite = 10 }: OpcoesAnalise = {},
): ArtistaDeMomento[] {
  const porArtista = new Map<string, { nome: string; momentos: Map<MomentoDoDia, number>; total: number }>();

  for (const s of scrobbles) {
    const data = parseDataScrobble(s);
    const chave = normalizarNome(s.artist_name);
    if (!data || !chave) continue;
    const momento = momentoDaHora(horaUTC(data));
    const registo = porArtista.get(chave) ?? { nome: s.artist_name, momentos: new Map(), total: 0 };
    registo.momentos.set(momento, (registo.momentos.get(momento) ?? 0) + 1);
    registo.total++;
    porArtista.set(chave, registo);
  }

  const resultado: ArtistaDeMomento[] = [];
  for (const { nome, momentos, total } of porArtista.values()) {
    if (total < minimoAudicoes) continue;
    let melhor: MomentoDoDia = "madrugada";
    let noMelhor = 0;
    for (const { momento } of MOMENTOS) {
      const n = momentos.get(momento) ?? 0;
      if (n > noMelhor) {
        melhor = momento;
        noMelhor = n;
      }
    }
    if (noMelhor / total >= limiar) {
      resultado.push({ artista: nome, momento: melhor, percentagem: (noMelhor / total) * 100, noMomento: noMelhor, total });
    }
  }

  return resultado
    .sort((a, b) => b.percentagem - a.percentagem || b.total - a.total || a.artista.localeCompare(b.artista, "pt"))
    .slice(0, limite);
}
