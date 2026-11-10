import type { Scrobble } from './types';
import { timestamp, horaUTC } from './dates';

export interface Item<T> { chave: string; count: number; exemplo: T }

/** Ranking genérico: agrupa por chave, conta e ordena. */
export function ranking<T>(itens: T[], chave: (x: T) => string | null | undefined, n?: number): Item<T>[] {
  const mapa = new Map<string, Item<T>>();
  for (const x of itens) {
    const k = chave(x);
    if (!k) continue;
    const atual = mapa.get(k);
    if (atual) atual.count++; else mapa.set(k, { chave: k, count: 1, exemplo: x });
  }
  const ordenado = [...mapa.values()].sort((a, b) => b.count - a.count);
  return n ? ordenado.slice(0, n) : ordenado;
}

export const totais = (l: Scrobble[]) => ({
  audicoes: l.length,
  artistas: new Set(l.map(s => s.artist_name)).size,
});

export const topArtistas = (l: Scrobble[], n = 20) => ranking(l, s => s.artist_name, n);
export const topMusicas  = (l: Scrobble[], n = 10) => ranking(l, s => `${s.artist_name}␟${s.track_name}`, n);
export const topAlbuns   = (l: Scrobble[], n = 8)  => ranking(l, s => s.album_name ? `${s.artist_name}␟${s.album_name}` : null, n);

export function porHora(l: Scrobble[]) {
  const horas = Array.from({ length: 24 }, (_, hora) => ({ hora, plays: 0 }));
  for (const s of l) { const t = timestamp(s); if (t !== null) horas[horaUTC(t)].plays++; }
  return horas;
}

export const splitVirgulas = (txt: string | null | undefined) =>
  (txt ?? '').split(',').map(t => t.trim()).filter(Boolean);

export function generoTop(l: Scrobble[]) {
  const tags = l.flatMap(s => splitVirgulas(s.tags).map(t => t.toLowerCase()));
  return ranking(tags, t => t, 1)[0] ?? null;
}