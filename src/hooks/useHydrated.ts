/**
 * hooks/useHydrated.ts — hidratação da store.
 *
 * A store usa `persist` com `skipHydration` (no servidor não há localStorage;
 * hidratar logo no 1.º render daria erro de hidratação no Next).
 * Este hook manda reidratar UMA vez, no cliente, depois de montar, e devolve
 * `true` quando a cache já foi lida do localStorage.
 *
 * Usa useSyncExternalStore: no servidor e no 1.º render do cliente devolve
 * `false` (o HTML bate certo), e depois acompanha o estado real da store.
 */
import { useEffect, useSyncExternalStore } from "react";
import { useStore } from "@/store/useStore";

let reidratacao: Promise<void> | null = null;

/** Garante que a reidratação corre uma só vez, mesmo com vários componentes. */
function reidratarUmaVez(): Promise<void> {
  if (!reidratacao) reidratacao = Promise.resolve(useStore.persist.rehydrate());
  return reidratacao;
}

const subscrever = (avisar: () => void) => useStore.persist.onFinishHydration(avisar);
const estaHidratado = () => useStore.persist.hasHydrated();
const noServidor = () => false;

export function useHydrated(): boolean {
  useEffect(() => {
    void reidratarUmaVez();
  }, []);
  return useSyncExternalStore(subscrever, estaHidratado, noServidor);
}
