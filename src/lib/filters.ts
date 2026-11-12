/**
 * lib/filters.ts — filtrar scrobbles.
 *
 * Funções puras: sem fetch, sem store e sem Date.now().
 */
import type { Periodo, Scrobble } from "@/types";
import { dataDeReferencia, inicioDoPeriodo, timestampScrobble } from "./dates";

/**
 * Forma comparável de um nome: sem espaços nas pontas, espaços repetidos
 * reduzidos a um, apóstrofos curvos (’) iguais aos retos (') e em minúsculas.
 * "  Adele " e "adele" ficam iguais; "Don’t" e "Don't" também.
 * Os acentos ficam: "Jão" e "Jao" podem ser artistas diferentes.
 */
export function normalizarNome(texto: string | null | undefined): string {
  return (texto ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’‘`´]/g, "'")
    .toLowerCase();
}

/**
 * "rock, indie ,pop" → ["rock", "indie", "pop"].
 * Divide, faz trim e tira os vazios.
 * Usa-se em `tags` e `similar_artists` (",") e em `tracklist_names` (";").
 */
export function separarLista(texto: string | null | undefined, separador = ","): string[] {
  return (texto ?? "")
    .split(separador)
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0);
}

/** Tira as audições "a tocar agora" e as que não têm data válida. */
export function removerSemData(scrobbles: Scrobble[]): Scrobble[] {
  return scrobbles.filter((s) => timestampScrobble(s) !== null);
}

/**
 * Só as audições dentro do período, já sem as que não têm data.
 *
 * A referência é a audição mais recente do array RECEBIDO (passa sempre o
 * array completo), e não o momento atual. Com dados antigos, contar a partir
 * de agora dava períodos vazios.
 * Para manter a coerência, todos os períodos usam a mesma referência.
 */
export function filtrarPorPeriodo(scrobbles: Scrobble[], periodo: Periodo): Scrobble[] {
  const comData = removerSemData(scrobbles);
  if (periodo === "tudo") return comData;

  const referencia = dataDeReferencia(comData);
  if (referencia === null) return [];

  const inicio = inicioDoPeriodo(periodo, referencia);
  if (inicio === null) return comData;

  const inicioMs = inicio.getTime();
  return comData.filter((s) => (timestampScrobble(s) as number) >= inicioMs);
}

/** Só as audições do artista (compara com `normalizarNome`). */
export function filtrarPorArtista(scrobbles: Scrobble[], nome: string): Scrobble[] {
  const alvo = normalizarNome(nome);
  if (!alvo) return [];
  return scrobbles.filter((s) => normalizarNome(s.artist_name) === alvo);
}
