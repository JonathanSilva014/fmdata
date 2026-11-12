/**
 * hooks/useAlbumInfo.ts — perfil do álbum (sobretudo track_count e tracklist,
 * para "Ouviste X de Y faixas").
 *
 * Opcional: se falhar, a interface deve degradar com elegância e mostrar só
 * "X faixas ouvidas" (coberturaDoAlbum(album, null) já faz isso).
 * Usar dentro do cartão de cada álbum, nunca dentro de um ciclo.
 */
import { useCallback } from "react";
import type { AlbumInfo } from "@/types";
import { normalizarNome } from "@/lib/filters";
import { chaveCacheAlbum, useStore } from "@/store/useStore";
import { useEntradaEmCache, type EstadoPedido } from "./useEntradaEmCache";

export function useAlbumInfo(artista: string, album: string): EstadoPedido<AlbumInfo> {
  const chave = chaveCacheAlbum(artista, album);
  const entrada = useStore((s) => s.albuns[chave]);
  const carregarAlbum = useStore((s) => s.carregarAlbum);
  const carregar = useCallback(() => carregarAlbum(artista, album), [carregarAlbum, artista, album]);
  const valido = normalizarNome(artista) !== "" && normalizarNome(album) !== "";
  return useEntradaEmCache(entrada, valido, carregar);
}
