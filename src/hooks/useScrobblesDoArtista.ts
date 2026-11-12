/**
 * hooks/useScrobblesDoArtista.ts — audições de um artista, a partir do
 * histórico COMPLETO (a página do artista é all-time: ignora o período).
 *
 * `existe` diz se o artista aparece nos teus dados (para "não encontrado").
 */
import { useMemo } from "react";
import type { Scrobble, Status } from "@/types";
import { filtrarPorArtista } from "@/lib/filters";
import { useScrobbles } from "./useScrobbles";

export interface EstadoScrobblesDoArtista {
  doArtista: Scrobble[];
  todos: Scrobble[];
  existe: boolean;
  status: Status;
  error: string | null;
  recarregar: () => void;
}

export function useScrobblesDoArtista(nome: string): EstadoScrobblesDoArtista {
  const { data: todos, status, error, recarregar } = useScrobbles();
  const doArtista = useMemo(() => filtrarPorArtista(todos, nome), [todos, nome]);
  return { doArtista, todos, existe: doArtista.length > 0, status, error, recarregar };
}
