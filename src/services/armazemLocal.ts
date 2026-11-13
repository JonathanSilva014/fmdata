/**
 * Cache do histórico de scrobbles em IndexedDB.
 *
 * Porque não no localStorage (como o resto da store): o histórico completo tem
 * ~51 700 scrobbles (~25 MB) e o localStorage aguenta ~5 MB. O IndexedDB guarda
 * centenas de MB, por isso o histórico sobrevive ao refresh sem novo pedido à API.
 *
 * Fica em services/ (e não em lib/) porque mexe no browser: lib/ só tem funções puras.
 * Nunca rebenta: sem IndexedDB (servidor, modo privado, bloqueado) devolve null
 * e a store faz o pedido normal à API.
 */
import type { Scrobble } from "@/types";

const BASE = "fmdata";
const TABELA = "cache";
const CHAVE_SCROBBLES = "scrobbles";

/** Ao fim deste tempo o histórico guardado é considerado velho e volta a pedir-se. */
export const VALIDADE_SCROBBLES_MS = 60 * 60 * 1000; // 1 hora

interface ScrobblesGuardados {
  /** Momento (ms) em que foram pedidos à API. */
  em: number;
  dados: Scrobble[];
}

function abrir(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolver) => {
    try {
      const pedido = indexedDB.open(BASE, 1);
      pedido.onupgradeneeded = () => pedido.result.createObjectStore(TABELA);
      pedido.onsuccess = () => resolver(pedido.result);
      pedido.onerror = () => resolver(null);
      pedido.onblocked = () => resolver(null);
    } catch {
      resolver(null);
    }
  });
}

/** Histórico guardado e ainda válido, ou null (não há, está velho, ou não há IndexedDB). */
export async function lerScrobblesGuardados(agora: number): Promise<ScrobblesGuardados | null> {
  const bd = await abrir();
  if (!bd) return null;
  return new Promise((resolver) => {
    try {
      const pedido = bd.transaction(TABELA, "readonly").objectStore(TABELA).get(CHAVE_SCROBBLES);
      pedido.onsuccess = () => {
        const guardado = pedido.result as ScrobblesGuardados | undefined;
        const valido = guardado && Array.isArray(guardado.dados) && agora - guardado.em < VALIDADE_SCROBBLES_MS;
        resolver(valido ? guardado : null);
      };
      pedido.onerror = () => resolver(null);
    } catch {
      resolver(null);
    } finally {
      bd.close();
    }
  });
}

/** Guarda o histórico. Se falhar (sem espaço, bloqueado), a app segue sem cache. */
export async function guardarScrobbles(dados: Scrobble[], em: number): Promise<void> {
  const bd = await abrir();
  if (!bd) return;
  await new Promise<void>((resolver) => {
    try {
      const transacao = bd.transaction(TABELA, "readwrite");
      transacao.objectStore(TABELA).put({ em, dados } satisfies ScrobblesGuardados, CHAVE_SCROBBLES);
      transacao.oncomplete = () => resolver();
      transacao.onerror = () => resolver();
      transacao.onabort = () => resolver();
    } catch {
      resolver();
    } finally {
      bd.close();
    }
  });
}
