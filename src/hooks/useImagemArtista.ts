/**
 * hooks/useImagemArtista.ts — foto do artista (top 20 do dashboard).
 *
 * O `image_url` dos scrobbles é a capa do álbum, não a foto do artista;
 * a foto vem de /artist-image. Cache persistida, por isso as 20 fotos
 * só se pedem uma vez. `data` é null se o artista não tiver foto:
 * mostrar um placeholder.
 */
import { useCallback } from "react";
import { chaveCacheArtista, useStore } from "@/store/useStore";
import { useEntradaEmCache, type EstadoPedido } from "./useEntradaEmCache";

export function useImagemArtista(nome: string): EstadoPedido<string | null> {
  const chave = chaveCacheArtista(nome);
  const entrada = useStore((s) => s.imagensArtistas[chave]);
  const carregarImagemArtista = useStore((s) => s.carregarImagemArtista);
  const carregar = useCallback(() => carregarImagemArtista(nome), [carregarImagemArtista, nome]);
  return useEntradaEmCache(entrada, chave !== "", carregar);
}
