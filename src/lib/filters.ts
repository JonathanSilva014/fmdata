import type { Scrobble, Periodo } from './types';
import { timestamp, DURACAO } from './dates';

export const comData = (lista: Scrobble[]) => lista.filter(s => timestamp(s) !== null);

/** A referência é a reprodução mais recente, não o "agora" (armadilha do enunciado). */
export function filtrarPorPeriodo(lista: Scrobble[], periodo: Periodo): Scrobble[] {
  const validos = comData(lista);
  if (periodo === 'all' || validos.length === 0) return validos;
  const maisRecente = validos.reduce((max, s) => Math.max(max, timestamp(s)!), 0);
  const inicio = maisRecente - DURACAO[periodo];
  return validos.filter(s => timestamp(s)! >= inicio);
}