/**
 * lib/formatar.ts — texto para o ecrã (funções puras).
 * As datas estão em lib/dates.ts; aqui ficam números e plurais.
 */

/** 51706 → "51 706" (separador de milhares de pt-PT). */
export function formatarNumero(n: number): string {
  return n.toLocaleString("pt-PT");
}

/** 31.31 → "31,3%" */
export function formatarPercentagem(p: number): string {
  return `${p.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`;
}

/** plural(1, "audição", "audições") → "1 audição"; plural(3, …) → "3 audições" */
export function plural(n: number, singular: string, varios: string): string {
  return `${formatarNumero(n)} ${n === 1 ? singular : varios}`;
}
