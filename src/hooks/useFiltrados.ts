/**
 * hooks/useFiltrados.ts — o hook que o dashboard inteiro consome.
 *
 * Junta useScrobbles + usePeriodo e devolve as reproduções já limpas (sem
 * "a tocar agora") e filtradas pelo período global (`scrobbles`), e também
 * as de cada secção (`porSeccao`), que podem ter uma exceção ao global.
 * Cada período só é filtrado uma vez, mesmo que várias secções o usem.
 * Fica em "loading" até a store estar hidratada, para não mostrar
 * "Tudo" e saltar logo a seguir para o período guardado.
 */
import { useMemo } from "react";
import type { Periodo, Scrobble, Seccao, Status } from "@/types";
import { dataDeReferencia } from "@/lib/dates";
import { filtrarPorPeriodo } from "@/lib/filters";
import { useHydrated } from "./useHydrated";
import { usePeriodo, usePeriodoDasSeccoes } from "./usePeriodo";
import { useScrobbles } from "./useScrobbles";

export interface EstadoFiltrados {
  /** Reproduções do período global (sem as que não têm data). */
  scrobbles: Scrobble[];
  /** Histórico completo, tal como veio da API. */
  todos: Scrobble[];
  /** Reprodução mais recente: a âncora dos períodos. */
  referencia: Date | null;
  /** Reproduções de cada secção, no período efetivo dessa secção. */
  porSeccao: Record<Seccao, Scrobble[]>;
  status: Status;
  error: string | null;
  recarregar: () => void;
}

export function useFiltrados(): EstadoFiltrados {
  const hidratado = useHydrated();
  const { periodo } = usePeriodo();
  const { periodos } = usePeriodoDasSeccoes();
  const { data: todos, status, error, recarregar } = useScrobbles();

  const referencia = useMemo(() => dataDeReferencia(todos), [todos]);

  // Um filtro por período distinto (o global + as exceções), partilhado pelas secções.
  const { scrobbles, porSeccao } = useMemo(() => {
    const porPeriodo = new Map<Periodo, Scrobble[]>();
    const filtrar = (p: Periodo) => {
      if (!porPeriodo.has(p)) porPeriodo.set(p, filtrarPorPeriodo(todos, p));
      return porPeriodo.get(p) as Scrobble[];
    };
    return {
      scrobbles: filtrar(periodo),
      porSeccao: Object.fromEntries(
        (Object.keys(periodos) as Seccao[]).map((s) => [s, filtrar(periodos[s])]),
      ) as Record<Seccao, Scrobble[]>,
    };
  }, [todos, periodo, periodos]);

  return {
    scrobbles,
    todos,
    referencia,
    porSeccao,
    status: hidratado ? status : "loading",
    error,
    recarregar,
  };
}
