/**
 * Ponto único de importação dos tipos: `import type { Scrobble, Entry } from "@/types"`.
 * - types/api.ts  → contratos da API (não editar à mão; vêm do openapi.json)
 * - este ficheiro → tipos do domínio da aplicação
 */
export * from "./api";

/** Opções do filtro de período do dashboard. */
export type Periodo = "tudo" | "30d" | "14d" | "7d" | "24h";

/** Estado de qualquer dado que vem da rede. */
export type Status = "idle" | "loading" | "success" | "error" | "not-found";

/** Envelope da cache: todos os dados da rede têm esta forma na store. */
export interface Entry<T> {
  data: T | null;
  status: Status;
  error: string | null;
  /** Momento (ms) do último sucesso; null se nunca carregou. */
  updatedAt: number | null;
}

/** Linha de qualquer ranking (artistas, músicas, álbuns). */
export interface ItemRanking {
  /** Identificador único, ex.: "artista::faixa". */
  chave: string;
  /** Texto principal a mostrar. */
  nome: string;
  /** Texto secundário, ex.: artista de uma faixa. */
  subtitulo?: string;
  contagem: number;
  imagem?: string | null;
}

/** Ponto do gráfico de scrobbles por mês. */
export interface PontoMensal {
  /** Ano-mês em UTC, ex.: "2024-03". */
  mes: string;
  contagem: number;
}

/** Artista semelhante, marcado se já aparece nos scrobbles do utilizador. */
export interface ArtistaSemelhante {
  nome: string;
  ouvido: boolean;
}
