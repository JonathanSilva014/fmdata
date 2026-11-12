/**
 * hooks/useFiltrados.ts — o hook que o dashboard inteiro consome.
 *
 * Junta useScrobbles + usePeriodo e devolve as audições já limpas (sem
 * "a tocar agora") e filtradas pelo período escolhido.
 * Fica em "loading" até a store estar hidratada, para não mostrar
 * "Tudo" e saltar logo a seguir para o período guardado.
 */
import { useMemo } from "react";
import type { Scrobble, Status } from "@/types";
import { dataDeReferencia } from "@/lib/dates";
import { filtrarPorPeriodo } from "@/lib/filters";
import { useHydrated } from "./useHydrated";
import { usePeriodo } from "./usePeriodo";
import { useScrobbles } from "./useScrobbles";

export interface EstadoFiltrados {
  /** Audições do período escolhido (sem as que não têm data). */
  scrobbles: Scrobble[];
  /** Histórico completo, tal como veio da API. */
  todos: Scrobble[];
  /** Audição mais recente: a âncora dos períodos. */
  referencia: Date | null;
  status: Status;
  error: string | null;
  recarregar: () => void;
}

export function useFiltrados(): EstadoFiltrados {
  const hidratado = useHydrated();
  const { periodo } = usePeriodo();
  const { data: todos, status, error, recarregar } = useScrobbles();

  const referencia = useMemo(() => dataDeReferencia(todos), [todos]);
  const scrobbles = useMemo(() => filtrarPorPeriodo(todos, periodo), [todos, periodo]);

  return {
    scrobbles,
    todos,
    referencia,
    status: hidratado ? status : "loading",
    error,
    recarregar,
  };
}
