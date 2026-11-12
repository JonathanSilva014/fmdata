/**
 * Camada de pedidos à API fmdata.
 *
 * É o ÚNICO sítio do projeto que faz `fetch`. As funções de `lib/` continuam
 * puras (sem rede, sem store), como exige o enunciado.
 *
 * Responsabilidades:
 *  - construir URLs (os parâmetros são codificados automaticamente pelo URLSearchParams)
 *  - traduzir respostas HTTP em dados tipados ou em `ApiError`
 *  - aguentar o "acordar" lento do servidor (timeout largo)
 *
 * NÃO faz cache nem deduplicação: isso é trabalho da store (store/useStore.ts).
 *
 * Docs da API: https://fmdata-api.onrender.com/docs
 */
import type {
  AlbumInfo,
  ArtistInfo,
  HealthResponse,
  HourCount,
  RespostaImagem,
  Scrobble,
} from "@/types";

export const API_BASE = "https://fmdata-api.onrender.com";

/**
 * Nomes dos parâmetros de query de cada endpoint.
 * - artist: ✅ confirmado (/artist-info?artist=Adele, /artist-image?artist=Adele)
 * - album: ✅ confirmado (/album-info?artist=Adele&album=25)
 * - track: ⚠️ por confirmar em /docs (só usado em /track-image)
 * Se algum estiver errado, a API responde 400 — corrige só aqui.
 */
export const PARAM = {
  artista: "artist",
  album: "album",
  faixa: "track",
} as const;

/** O Render gratuito pode demorar ~1 min a acordar no primeiro pedido. */
const TIMEOUT_MS = 60_000;

// ---------------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------------

/**
 * - not-found   → 404: o recurso não existe (ex.: artista sem perfil)
 * - bad-request → 400: parâmetro em falta/errado (é bug nosso, não do utilizador)
 * - server      → outro erro HTTP ou resposta ilegível
 * - network     → sem ligação / pedido bloqueado
 * - timeout     → a API não respondeu a tempo
 */
export type TipoErroApi = "not-found" | "bad-request" | "server" | "network" | "timeout";

export class ApiError extends Error {
  constructor(
    public readonly tipo: TipoErroApi,
    message: string,
    public readonly status: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Atalho para a store: um 404 vira `status: "not-found"`, não `"error"`. */
export function isNotFound(erro: unknown): boolean {
  return erro instanceof ApiError && erro.tipo === "not-found";
}

/** Mensagem pronta a mostrar ao utilizador, seja qual for o erro. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  if (erro instanceof Error) return erro.message;
  return "Ocorreu um erro inesperado.";
}

// ---------------------------------------------------------------------------
// Núcleo
// ---------------------------------------------------------------------------

type Params = Record<string, string | number | undefined>;

/**
 * Constrói o URL completo. `URLSearchParams` codifica os valores
 * (espaços, acentos, "&", "/"...), por isso nomes como "AC/DC" são seguros.
 */
export function construirUrl(caminho: string, params: Params = {}): string {
  const url = new URL(caminho, API_BASE);
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== "") url.searchParams.set(chave, String(valor));
  }
  return url.toString();
}

/** Lê a mensagem de erro do corpo (formato FastAPI: `{ "detail": "..." }`). */
async function lerDetalhe(res: Response, alternativa: string): Promise<string> {
  try {
    const corpo: unknown = await res.json();
    if (corpo && typeof corpo === "object" && "detail" in corpo) {
      const detalhe = (corpo as { detail: unknown }).detail;
      if (typeof detalhe === "string" && detalhe.trim()) return detalhe;
    }
  } catch {
    // corpo vazio ou não-JSON: usa a alternativa
  }
  return alternativa;
}

/** GET genérico: devolve o JSON tipado ou lança `ApiError`. */
async function pedir<T>(caminho: string, params?: Params): Promise<T> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(construirUrl(caminho, params), {
      headers: { Accept: "application/json" },
      signal: controlador.signal,
    });
  } catch {
    if (controlador.signal.aborted) {
      throw new ApiError("timeout", "A API demorou demasiado a responder. Tenta de novo.");
    }
    throw new ApiError("network", "Não foi possível ligar à API. Verifica a tua ligação.");
  } finally {
    clearTimeout(temporizador);
  }

  if (res.status === 404) {
    throw new ApiError("not-found", await lerDetalhe(res, "Não encontrado."), 404);
  }
  if (res.status === 400) {
    throw new ApiError("bad-request", await lerDetalhe(res, "Pedido inválido: parâmetro em falta."), 400);
  }
  if (!res.ok) {
    throw new ApiError("server", `A API respondeu com erro ${res.status}.`, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("server", "A resposta da API não é JSON válido.", res.status);
  }
}

/**
 * A API devolve as listas como array direto (`[...]`), confirmado em /scrobbles.
 * Se vier outra coisa, é um erro do servidor e mostra-se o estado de erro.
 */
function exigirLista<T>(corpo: unknown, endpoint: string): T[] {
  if (!Array.isArray(corpo)) {
    throw new ApiError("server", `Formato inesperado na resposta de ${endpoint}.`);
  }
  return corpo as T[];
}

/** Evita pedidos com nome vazio (a API responderia 400). */
function exigir(valor: string, campo: string): string {
  const limpo = valor.trim();
  if (!limpo) throw new ApiError("bad-request", `Falta o ${campo}.`);
  return limpo;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** GET /health — saber se a API está acordada. */
export async function obterHealth(): Promise<HealthResponse> {
  return pedir<HealthResponse>("/health");
}

/** GET /scrobbles — histórico completo de audições. */
export async function obterScrobbles(): Promise<Scrobble[]> {
  return exigirLista<Scrobble>(await pedir<unknown>("/scrobbles"), "/scrobbles");
}

/** GET /scrobbles/amostra — subconjunto pequeno, útil para testar funções puras. */
export async function obterAmostraScrobbles(): Promise<Scrobble[]> {
  return exigirLista<Scrobble>(await pedir<unknown>("/scrobbles/amostra"), "/scrobbles/amostra");
}

/** GET /artist-info — perfil do artista. 404 → `ApiError` com tipo "not-found". */
export async function obterArtistInfo(nome: string): Promise<ArtistInfo> {
  return pedir<ArtistInfo>("/artist-info", { [PARAM.artista]: exigir(nome, "nome do artista") });
}

/** GET /album-info — perfil do álbum (track_count, tracklist_names...). */
export async function obterAlbumInfo(artista: string, album: string): Promise<AlbumInfo> {
  return pedir<AlbumInfo>("/album-info", {
    [PARAM.artista]: exigir(artista, "nome do artista"),
    [PARAM.album]: exigir(album, "nome do álbum"),
  });
}

/**
 * GET /stats/listening-clock — reproduções por hora (UTC) calculadas pela API.
 * Serve para CONFIRMAR que `scrobblesPorHora()` de lib/ está certa;
 * os gráficos devem usar as funções puras (é isso que é avaliado).
 */
export async function obterListeningClock(): Promise<HourCount[]> {
  return exigirLista<HourCount>(await pedir<unknown>("/stats/listening-clock"), "/stats/listening-clock");
}

// ---------------------------------------------------------------------------
// Imagens: os endpoints devolvem JSON com o URL (confirmado em /artist-image:
// { "artist": "Adele", "image_url": "https://..." }), não a imagem em si.
// Devolvem só o URL, ou null se não houver imagem.
// ---------------------------------------------------------------------------

async function obterUrlImagem(caminho: string, params: Params): Promise<string | null> {
  const corpo = await pedir<RespostaImagem>(caminho, params);
  return corpo.image_url?.trim() ? corpo.image_url : null;
}

/** GET /artist-image — foto do artista (para o top 20 do dashboard). */
export async function obterImagemArtista(nome: string): Promise<string | null> {
  return obterUrlImagem("/artist-image", { [PARAM.artista]: exigir(nome, "nome do artista") });
}

/** GET /album-image — capa do álbum. */
export async function obterImagemAlbum(artista: string, album: string): Promise<string | null> {
  return obterUrlImagem("/album-image", {
    [PARAM.artista]: exigir(artista, "nome do artista"),
    [PARAM.album]: exigir(album, "nome do álbum"),
  });
}

/** GET /track-image — capa da faixa. ⚠️ Confirmar o parâmetro `track` em /docs. */
export async function obterImagemFaixa(artista: string, faixa: string): Promise<string | null> {
  return obterUrlImagem("/track-image", {
    [PARAM.artista]: exigir(artista, "nome do artista"),
    [PARAM.faixa]: exigir(faixa, "nome da faixa"),
  });
}
