/**
 * hooks/usePeriodo.ts — filtro global de período (só o dashboard o usa;
 * a página do artista é sempre all-time).
 *
 * usePeriodo()          → o período de TODO o dashboard (muda-o e apaga as exceções).
 * usePeriodoDasSeccoes() → o período efetivo de cada secção e o filtro de cada uma.
 *
 * Seletores separados: o componente só re-renderiza quando o que usa muda.
 */
import { useMemo } from "react";
import type { Periodo, PeriodosPorSeccao, Seccao } from "@/types";
import { periodosDasSeccoes } from "@/lib/filters";
import { useStore } from "@/store/useStore";

export function usePeriodo(): { periodo: Periodo; setPeriodo: (periodo: Periodo) => void } {
  const periodo = useStore((s) => s.periodo);
  const setPeriodo = useStore((s) => s.setPeriodo);
  return { periodo, setPeriodo };
}

export function usePeriodoDasSeccoes(): {
  periodos: PeriodosPorSeccao;
  setPeriodoDaSeccao: (seccao: Seccao, periodo: Periodo) => void;
} {
  const periodo = useStore((s) => s.periodo);
  const excecoes = useStore((s) => s.excecoes);
  const setPeriodoDaSeccao = useStore((s) => s.setPeriodoDaSeccao);
  const periodos = useMemo(() => periodosDasSeccoes(periodo, excecoes), [periodo, excecoes]);
  return { periodos, setPeriodoDaSeccao };
}
