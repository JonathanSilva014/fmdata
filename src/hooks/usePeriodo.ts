/**
 * hooks/usePeriodo.ts — filtro global de período (só o dashboard o usa;
 * a página do artista é sempre all-time).
 *
 * Seletores separados: o componente só re-renderiza quando o período muda.
 */
import type { Periodo } from "@/types";
import { useStore } from "@/store/useStore";

export function usePeriodo(): { periodo: Periodo; setPeriodo: (periodo: Periodo) => void } {
  const periodo = useStore((s) => s.periodo);
  const setPeriodo = useStore((s) => s.setPeriodo);
  return { periodo, setPeriodo };
}
