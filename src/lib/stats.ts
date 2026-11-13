/**
 * lib/stats.ts — rankings e contagens.
 *
 * Funções puras: sem fetch, sem store e sem Date.now().
 * Contam o que recebem. O dashboard passa-lhes os scrobbles já filtrados
 * (useFiltrados → removerSemData + filtrarPorPeriodo), por isso a faixa
 * "a tocar agora" não é contada duas vezes.
 */
import type { GeneroContagem, ItemRanking, Scrobble } from "@/types";
import { horaUTC, parseDataScrobble } from "./dates";
import { normalizarNome, separarLista } from "./filters";

/** Função que dá a chave de agrupamento de um item (null = ignorar o item). */
type Chave<T> = (item: T) => string | null;

// ---------------------------------------------------------------------------
// Motor genérico
// ---------------------------------------------------------------------------

/** Contagem genérica: quantas vezes aparece cada chave. É o motor dos rankings. */
export function contarPor<T>(itens: T[], chave: Chave<T>): Map<string, number> {
  const contagens = new Map<string, number>();
  for (const item of itens) {
    const k = chave(item);
    if (k) contagens.set(k, (contagens.get(k) ?? 0) + 1);
  }
  return contagens;
}

/**
 * Ordena do maior para o menor e corta no `limite`.
 * Desempate por ordem alfabética da chave, para o ranking não mudar
 * de ordem entre renders.
 */
export function paraRanking(
  contagens: Map<string, number>,
  limite?: number,
): { chave: string; contagem: number }[] {
  const ordenado = [...contagens.entries()]
    .map(([chave, contagem]) => ({ chave, contagem }))
    .sort((a, b) => b.contagem - a.contagem || a.chave.localeCompare(b.chave, "pt"));
  return limite === undefined ? ordenado : ordenado.slice(0, limite);
}

/**
 * Ranking de scrobbles: conta por `chave` e usa a primeira audição de cada
 * grupo (a mais recente, porque a API devolve do mais recente para o mais
 * antigo) para obter o nome, o álbum e a imagem.
 * Também é usado em lib/artist.ts.
 */
export function rankingPor(
  scrobbles: Scrobble[],
  chave: Chave<Scrobble>,
  descrever: (exemplo: Scrobble) => Omit<ItemRanking, "chave" | "contagem">,
  limite?: number,
): ItemRanking[] {
  const exemplos = new Map<string, Scrobble>();
  for (const s of scrobbles) {
    const k = chave(s);
    if (k && !exemplos.has(k)) exemplos.set(k, s);
  }
  return paraRanking(contarPor(scrobbles, chave), limite).map(({ chave: k, contagem }) => ({
    chave: k,
    contagem,
    ...descrever(exemplos.get(k) as Scrobble),
  }));
}

// ---------------------------------------------------------------------------
// Chaves (nunca só o título: "Hello" da Adele ≠ "Hello" de outro artista)
// ---------------------------------------------------------------------------

const chaveArtista: Chave<Scrobble> = (s) => normalizarNome(s.artist_name) || null;

const chaveMusica: Chave<Scrobble> = (s) => {
  const artista = normalizarNome(s.artist_name);
  const faixa = normalizarNome(s.track_name);
  return artista && faixa ? `${artista}::${faixa}` : null;
};

/** Audições sem álbum são ignoradas (não há capa nem título para mostrar). */
const chaveAlbum: Chave<Scrobble> = (s) => {
  const artista = normalizarNome(s.artist_name);
  const album = normalizarNome(s.album_name);
  return artista && album ? `${artista}::${album}` : null;
};

// ---------------------------------------------------------------------------
// Totais
// ---------------------------------------------------------------------------

/** N.º de audições. */
export function totalScrobbles(scrobbles: Scrobble[]): number {
  return scrobbles.length;
}

/** N.º de artistas distintos ("Adele" e "adele" contam como um). */
export function totalArtistasDistintos(scrobbles: Scrobble[]): number {
  return contarPor(scrobbles, chaveArtista).size;
}

// ---------------------------------------------------------------------------
// Rankings do dashboard
// ---------------------------------------------------------------------------

/**
 * Top artistas. `imagem` fica null de propósito: o `image_url` dos scrobbles
 * é a capa do álbum, não a foto do artista. A foto vem de /artist-image.
 */
export function topArtistas(scrobbles: Scrobble[], n = 20): ItemRanking[] {
  return rankingPor(
    scrobbles,
    chaveArtista,
    (s) => ({ nome: s.artist_name, artista: s.artist_name, imagem: null }),
    n,
  );
}

/** Top músicas: capa, faixa, artista, álbum e contagem. */
export function topMusicas(scrobbles: Scrobble[], n = 10): ItemRanking[] {
  return rankingPor(
    scrobbles,
    chaveMusica,
    (s) => ({
      nome: s.track_name,
      subtitulo: s.artist_name,
      artista: s.artist_name,
      album: s.album_name || undefined,
      imagem: s.image_url,
    }),
    n,
  );
}

/** Top álbuns: capa, título, artista e plays. */
export function topAlbuns(scrobbles: Scrobble[], n = 8): ItemRanking[] {
  return rankingPor(
    scrobbles,
    chaveAlbum,
    (s) => ({
      nome: s.album_name,
      subtitulo: s.artist_name,
      artista: s.artist_name,
      album: s.album_name,
      imagem: s.image_url,
    }),
    n,
  );
}

// ---------------------------------------------------------------------------
// Horas
// ---------------------------------------------------------------------------

/**
 * Audições por hora do dia (UTC). Devolve SEMPRE 24 posições (0–23),
 * com 0 nas horas sem audições, para o gráfico ter as 24 barras.
 * Também serve para o relógio 24h da página do artista.
 */
export function scrobblesPorHora(scrobbles: Scrobble[]): number[] {
  const horas = new Array<number>(24).fill(0);
  for (const s of scrobbles) {
    const data = parseDataScrobble(s);
    if (data) horas[horaUTC(data)]++;
  }
  return horas;
}

/** Hora com mais audições (em empate, a mais cedo). null se tudo for 0. */
export function horaDePico(porHora: number[]): number | null {
  let pico: number | null = null;
  porHora.forEach((valor, hora) => {
    if (valor > 0 && (pico === null || valor > porHora[pico])) pico = hora;
  });
  return pico;
}

// ---------------------------------------------------------------------------
// Género
// ---------------------------------------------------------------------------

/**
 * Etiqueta que mais aparece nas audições: cada audição soma 1 a cada uma
 * das suas tags. Em minúsculas, para "Rock" e "rock" contarem juntas.
 * null se nenhuma audição tiver tags.
 */
export function generoMaisOuvido(scrobbles: Scrobble[]): GeneroContagem | null {
  const contagens = new Map<string, number>();
  for (const s of scrobbles) {
    const tags = new Set(separarLista(s.tags).map((t) => t.toLowerCase()));
    for (const tag of tags) contagens.set(tag, (contagens.get(tag) ?? 0) + 1);
  }
  const [primeiro] = paraRanking(contagens, 1);
  return primeiro ? { genero: primeiro.chave, contagem: primeiro.contagem } : null;
}
