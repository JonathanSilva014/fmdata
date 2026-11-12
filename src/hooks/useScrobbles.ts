/**
 * hooks/useScrobbles.ts — histórico completo de audições.
 *
 * Pede os scrobbles quando o componente monta. A store trata da cache (só se
 * pede uma vez por sessão) e da deduplicação (vários componentes → 1 pedido).
 */
import { useEffect } from "react";
import type { Scrobble, Status } from "@/types";
import { useStore } from "@/store/useStore";

/** Array vazio ESTÁVEL: um `[]` novo em cada render invalidava os useMemo a jusante. */
const SEM_SCROBBLES: Scrobble[] = [];

export interface EstadoScrobbles {
  data: Scrobble[];
  /** "idle" aparece como "loading": se ainda não há dados, estão a caminho. */
  status: Status;
  error: string | null;
  /** Volta a tentar (para o botão "tentar de novo"). */
  recarregar: () => void;
}

export function useScrobbles(): EstadoScrobbles {
  const entrada = useStore((s) => s.scrobbles);
  const carregar = useStore((s) => s.carregarScrobbles);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    data: entrada.data ?? SEM_SCROBBLES,
    status: entrada.status === "idle" ? "loading" : entrada.status,
    error: entrada.error,
    recarregar: () => void carregar(),
  };
}
