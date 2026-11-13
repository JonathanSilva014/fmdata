/**
 * Ponto único de importação dos tipos: `import type { Scrobble, Entry } from "@/types"`.
 * - types/api.ts  → contratos da API (não editar à mão; vêm do openapi.json)
 * - este ficheiro → tipos do domínio da aplicação
 */
export * from "./api";

/**
 * Resposta de /artist-image, /album-image e /track-image.
 * Confirmado em /artist-image: { "artist": "Adele", "image_url": "https://..." }.
 * Só usamos `image_url`; os outros campos variam conforme o endpoint.
 */
export interface RespostaImagem {
  image_url: string | null;
}

/** Opções do filtro de período do dashboard. */
export type Periodo = "tudo" | "30d" | "14d" | "7d" | "24h";

/** Secções do dashboard com filtro de período próprio. */
export type Seccao = "totais" | "artistas" | "horas" | "musicas" | "albuns" | "analise";

/** O período efetivo de cada secção (o global, ou a exceção dessa secção). */
export type PeriodosPorSeccao = Record<Seccao, Periodo>;

/** Secções com um período diferente do global. */
export type ExcecoesDePeriodo = Partial<Record<Seccao, Periodo>>;

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
  /** Nome do artista tal como vem da API: serve para o link /artistas/[nome]. */
  artista?: string;
  /** Álbum (top músicas e top álbuns). */
  album?: string;
}

/** Género mais ouvido (a partir das tags). */
export interface GeneroContagem {
  genero: string;
  contagem: number;
}

/** Ponto do gráfico de scrobbles por mês. */
export interface PontoMensal {
  /** Ano-mês em UTC, ex.: "2024-03". */
  mes: string;
  contagem: number;
}

/** Cartões de estatísticas da página do artista. */
export interface ResumoArtista {
  /** N.º de audições do artista. */
  total: number;
  /** Percentagem das tuas audições (0–100). */
  percentagem: number;
  /** N.º de faixas DISTINTAS marcadas como favoritas (loved = 1). */
  favoritas: number;
  primeira: Date | null;
  ultima: Date | null;
}

/** Álbum de um artista, visto a partir dos scrobbles. */
export interface AlbumDoArtista {
  /** Nome do álbum normalizado. */
  chave: string;
  nome: string;
  artista: string;
  imagem: string | null;
  /** N.º de audições deste álbum. */
  contagem: number;
  /** Faixas distintas ouvidas, normalizadas (o "X" de "Ouviste X de Y faixas"). */
  faixasOuvidas: string[];
}

/** "Ouviste X de Y faixas". `total` é null se não houver info do álbum. */
export interface Cobertura {
  ouvidas: number;
  total: number | null;
}

/** Artista semelhante, marcado se já aparece nos scrobbles do utilizador. */
export interface ArtistaSemelhante {
  nome: string;
  ouvido: boolean;
}
