/**
 * hooks/useArtistInfo.ts — perfil do artista (foto, tags, bio, links, semelhantes).
 *
 * Cache por nome normalizado ("Adele" = " adele "), persistida em localStorage.
 * Um 404 dá status "not-found" (página própria); outro erro dá "error"
 * (mostrar "tentar de novo" com `recarregar`).
 */
import { useCallback } from "react";
import type { ArtistInfo } from "@/types";
import { chaveCacheArtista, useStore } from "@/store/useStore";
import { useEntradaEmCache, type EstadoPedido } from "./useEntradaEmCache";

export function useArtistInfo(nome: string): EstadoPedido<ArtistInfo> {
  const chave = chaveCacheArtista(nome);
  const entrada = useStore((s) => s.artistas[chave]);
  const carregarArtista = useStore((s) => s.carregarArtista);
  const carregar = useCallback(() => carregarArtista(nome), [carregarArtista, nome]);
  return useEntradaEmCache(entrada, chave !== "", carregar);
}
