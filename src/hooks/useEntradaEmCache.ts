/**
 * hooks/useEntradaEmCache.ts — peça comum a useArtistInfo, useAlbumInfo e
 * useImagemArtista (evita repetir a mesma lógica três vezes).
 *
 * Espera pela hidratação (a resposta pode já estar no localStorage) e só
 * depois pede. A store decide se é preciso ir à rede.
 */
import { useEffect } from "react";
import type { Entry, Status } from "@/types";
import { useHydrated } from "./useHydrated";

export interface EstadoPedido<T> {
  data: T | null;
  /** "loading" | "success" | "error" | "not-found" ("idle" aparece como "loading"). */
  status: Status;
  error: string | null;
  /** Volta a tentar (para o botão "tentar de novo"). */
  recarregar: () => void;
}

/**
 * @param entrada  o que está na store para esta chave (undefined = nunca pedido)
 * @param valido   false quando falta o nome: dá "not-found" sem pedir nada
 * @param carregar função estável (useCallback) que pede à store
 */
export function useEntradaEmCache<T>(
  entrada: Entry<T> | undefined,
  valido: boolean,
  carregar: () => Promise<void>,
): EstadoPedido<T> {
  const hidratado = useHydrated();

  useEffect(() => {
    if (hidratado && valido) void carregar();
  }, [hidratado, valido, carregar]);

  if (!valido) return { data: null, status: "not-found", error: null, recarregar: () => {} };

  const status: Status = !hidratado || !entrada || entrada.status === "idle" ? "loading" : entrada.status;
  return {
    data: entrada?.data ?? null,
    status,
    error: entrada?.error ?? null,
    recarregar: () => void carregar(),
  };
}
