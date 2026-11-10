import type { Scrobble, ArtistInfo, AlbumInfo } from './types';
import { timestamp, mesUTC } from './dates';
import { ranking, splitVirgulas } from './stats';

const igual = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const doArtista = (l: Scrobble[], nome: string) => l.filter(s => igual(s.artist_name, nome));

export function statsArtista(doArt: Scrobble[], totalGeral: number) {
  const tempos = doArt.map(timestamp).filter((t): t is number => t !== null);
  return {
    total: doArt.length,
    percentagem: totalGeral ? (doArt.length / totalGeral) * 100 : 0,
    favoritas: new Set(doArt.filter(s => s.loved === 1).map(s => s.track_name)).size,
    primeira: tempos.length ? Math.min(...tempos) : null,
    ultima: tempos.length ? Math.max(...tempos) : null,
  };
}

export function porMes(doArt: Scrobble[]) {
  const r = ranking(doArt, s => { const t = timestamp(s); return t === null ? null : mesUTC(t); });
  return r.map(i => ({ mes: i.chave, plays: i.count })).sort((a, b) => a.mes.localeCompare(b.mes));
}

export const ultimas = (doArt: Scrobble[], n = 10) =>
  doArt.filter(s => timestamp(s) !== null)
       .sort((a, b) => timestamp(b)! - timestamp(a)!)
       .slice(0, n);

/** "Ouviste X de Y faixas" */
export function cobertura(doArt: Scrobble[], album: AlbumInfo) {
  const faixas = album.tracklist_names.split(';').map(t => t.trim().toLowerCase()).filter(Boolean);
  const ouvidas = new Set(doArt.map(s => s.track_name.toLowerCase()));
  return { ouvidas: faixas.filter(f => ouvidas.has(f)).length, total: album.track_count || faixas.length };
}

export function semelhantes(info: ArtistInfo, todos: Scrobble[]) {
  const ouvidos = new Set(todos.map(s => s.artist_name.toLowerCase()));
  return splitVirgulas(info.similar_artists).map(nome => ({ nome, ouvido: ouvidos.has(nome.toLowerCase()) }));
}