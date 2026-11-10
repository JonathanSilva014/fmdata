import type { Scrobble, Periodo } from './types';

/** Timestamp em ms, ou null se não tiver data válida (nowplaying, null...). */
export function timestamp(s: Scrobble): number | null {
  if (s.nowplaying) return null;
  if (s.date_uts) return s.date_uts * 1000;
  if (s.date_iso && s.date_iso !== 'nowplaying') {
    const t = Date.parse(s.date_iso);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export const horaUTC = (ms: number) => new Date(ms).getUTCHours();

export const mesUTC = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const DIA = 86_400_000;
export const DURACAO: Record<Exclude<Periodo, 'all'>, number> = {
  '30d': 30 * DIA, '14d': 14 * DIA, '7d': 7 * DIA, '24h': DIA,
};