/**
 * Camada de pedidos à API fmdata.
 * Docs da API: https://fmdata-api.onrender.com/docs
 */
import type {
  AlbumInfo,
  ArtistInfo,
  HealthResponse,
  HourCount,
  Scrobble,
} from "@/types";

export const API_BASE = "https://fmdata-api.onrender.com";

/**
 * Nomes dos parâmetros de query de cada endpoint.
 * ⚠️ CONFIRMAR EM /docs (secção "Parameters" de cada endpoint).
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
 * Aceita tanto `[...]` como `{ scrobbles: [...] }` / `{ items: [...] }` / `{ data: [...] }`.
 * ⚠️ Quando confirmares em /docs o formato real, podes simplificar isto.
 */
function comoLista<T>(corpo: unknown, endpoint: string): T[] {
  if (Array.isArray(corpo)) return corpo as T[];
  if (corpo && typeof corpo === "object") {
    for (const chave of ["scrobbles", "items", "data", "results"]) {
      const valor = (corpo as Record<string, unknown>)[chave];
      if (Array.isArray(valor)) return valor as T[];
    }
  }
  throw new ApiError("server", `Formato inesperado na resposta de ${endpoint}.`);
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
  return comoLista<Scrobble>(await pedir<unknown>("/scrobbles"), "/scrobbles");
}

/** GET /scrobbles/amostra — subconjunto pequeno, útil para testar funções puras. */
export async function obterAmostraScrobbles(): Promise<Scrobble[]> {
  return comoLista<Scrobble>(await pedir<unknown>("/scrobbles/amostra"), "/scrobbles/amostra");
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
  return comoLista<HourCount>(await pedir<unknown>("/stats/listening-clock"), "/stats/listening-clock");
}

// ---------------------------------------------------------------------------
// Imagens: URLs para usar diretamente em <img src>, sem fetch.
// ⚠️ Confirmar em /docs se estes endpoints devolvem a imagem (ou redirect).
//    Se devolverem JSON com um URL, é preciso trocar por funções com `pedir`.
// ---------------------------------------------------------------------------

export function urlImagemArtista(nome: string): string {
  return construirUrl("/artist-image", { [PARAM.artista]: nome });
}

export function urlImagemAlbum(artista: string, album: string): string {
  return construirUrl("/album-image", { [PARAM.artista]: artista, [PARAM.album]: album });
}

export function urlImagemFaixa(artista: string, faixa: string): string {
  return construirUrl("/track-image", { [PARAM.artista]: artista, [PARAM.faixa]: faixa });
}
