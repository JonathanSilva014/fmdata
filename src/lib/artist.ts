/**
 * lib/artist.ts — análise por artista (página /artistas/[nome], sempre all-time).
 *
 * Funções puras: sem fetch, sem store e sem Date.now().
 * Quase todas recebem `doArtista` = filtrarPorArtista(todos, nome).
 */
import type {
  AlbumDoArtista,
  AlbumInfo,
  ArtistaSemelhante,
  ArtistInfo,
  Cobertura,
  ItemRanking,
  PontoMensal,
  ResumoArtista,
  Scrobble,
} from "@/types";
import { chaveDoMes, mesesEntre, timestampScrobble } from "./dates";
import { normalizarNome, removerSemData, separarLista } from "./filters";
import { contarPor, rankingPor } from "./stats";

/**
 * Cartões de estatísticas: total, percentagem, favoritas, primeira e última.
 * As audições sem data ("a tocar agora") não contam, nem no artista nem no total,
 * para não contar a mesma faixa duas vezes.
 */
export function resumoDoArtista(doArtista: Scrobble[], todos: Scrobble[]): ResumoArtista {
  const doArtistaComData = removerSemData(doArtista);
  const totalGeral = removerSemData(todos).length;

  let primeira: number | null = null;
  let ultima: number | null = null;
  for (const s of doArtistaComData) {
    const ms = timestampScrobble(s) as number;
    if (primeira === null || ms < primeira) primeira = ms;
    if (ultima === null || ms > ultima) ultima = ms;
  }

  const favoritas = new Set(
    doArtista.filter((s) => s.loved === 1).map((s) => normalizarNome(s.track_name)),
  ).size;

  return {
    total: doArtistaComData.length,
    percentagem: totalGeral === 0 ? 0 : (doArtistaComData.length / totalGeral) * 100,
    favoritas,
    primeira: primeira === null ? null : new Date(primeira),
    ultima: ultima === null ? null : new Date(ultima),
  };
}

/** Top músicas do artista, agrupadas por faixa: capa e contagem. */
export function topMusicasDoArtista(doArtista: Scrobble[], n = 10): ItemRanking[] {
  return rankingPor(
    removerSemData(doArtista),
    (s) => normalizarNome(s.track_name) || null,
    (s) => ({
      nome: s.track_name,
      subtitulo: s.album_name || undefined,
      artista: s.artist_name,
      album: s.album_name || undefined,
      imagem: s.image_url,
    }),
    n,
  );
}

/**
 * Álbuns do artista, do mais ouvido para o menos ouvido, com as faixas
 * distintas ouvidas de cada um. O "Y" (total de faixas) vem do /album-info:
 * junta-se com `coberturaDoAlbum`.
 */
export function albunsDoArtista(doArtista: Scrobble[]): AlbumDoArtista[] {
  const comData = removerSemData(doArtista);
  const chaveAlbum = (s: Scrobble) => normalizarNome(s.album_name) || null;

  const faixas = new Map<string, Set<string>>();
  for (const s of comData) {
    const k = chaveAlbum(s);
    if (!k) continue;
    if (!faixas.has(k)) faixas.set(k, new Set());
    (faixas.get(k) as Set<string>).add(normalizarNome(s.track_name));
  }

  return rankingPor(comData, chaveAlbum, (s) => ({
    nome: s.album_name,
    artista: s.artist_name,
    imagem: s.image_url,
  })).map((item) => ({
    chave: item.chave,
    nome: item.nome,
    artista: item.artista as string,
    imagem: item.imagem ?? null,
    contagem: item.contagem,
    faixasOuvidas: [...(faixas.get(item.chave) ?? [])],
  }));
}

/**
 * "Ouviste X de Y faixas".
 * Com a info do álbum, X conta só as faixas da tracklist oficial (assim
 * X nunca passa de Y por causa de versões ou faixas bónus).
 * Sem info (pedido falhou), mostra só X e `total` fica null.
 */
export function coberturaDoAlbum(album: AlbumDoArtista, info: AlbumInfo | null): Cobertura {
  if (!info) return { ouvidas: album.faixasOuvidas.length, total: null };
  const tracklist = new Set(separarLista(info.tracklist_names, ";").map(normalizarNome));
  const ouvidas = album.faixasOuvidas.filter((f) => tracklist.has(f)).length;
  return { ouvidas, total: info.track_count || tracklist.size };
}

/**
 * Audições por mês, por ordem cronológica, com os meses sem audições a 0
 * (sem isso o gráfico "salta" meses e engana a leitura).
 */
export function scrobblesPorMes(doArtista: Scrobble[]): PontoMensal[] {
  const porMes = contarPor(doArtista, (s) => {
    const ms = timestampScrobble(s);
    return ms === null ? null : chaveDoMes(new Date(ms));
  });
  if (porMes.size === 0) return [];
  const meses = [...porMes.keys()].sort();
  return mesesEntre(meses[0], meses[meses.length - 1]).map((mes) => ({
    mes,
    contagem: porMes.get(mes) ?? 0,
  }));
}

/** As n audições mais recentes (sem as que não têm data). */
export function ultimasAudicoes(doArtista: Scrobble[], n = 10): Scrobble[] {
  return removerSemData(doArtista)
    .sort((a, b) => (timestampScrobble(b) as number) - (timestampScrobble(a) as number))
    .slice(0, n);
}

/**
 * Artistas semelhantes (do perfil), com `ouvido: true` se aparecem nos teus
 * scrobbles. Só os ouvidos são clicáveis na interface.
 */
export function artistasSemelhantes(info: ArtistInfo, todos: Scrobble[]): ArtistaSemelhante[] {
  const ouvidos = new Set(todos.map((s) => normalizarNome(s.artist_name)));
  return separarLista(info.similar_artists).map((nome) => ({
    nome,
    ouvido: ouvidos.has(normalizarNome(nome)),
  }));
}
