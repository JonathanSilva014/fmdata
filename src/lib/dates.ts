/**
 * lib/dates.ts — datas, horas e períodos.
 *
 * Funções puras: sem fetch, sem store e sem Date.now().
 * Tudo em UTC, como o gráfico 24h e o /stats/listening-clock da API.
 */
import type { Periodo, Scrobble } from "@/types";

const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

/** Tabela única de períodos: para acrescentar "90d", só se mexe aqui. */
const DURACAO_MS: Record<Exclude<Periodo, "tudo">, number> = {
  "30d": 30 * DIA_MS,
  "14d": 14 * DIA_MS,
  "7d": 7 * DIA_MS,
  "24h": DIA_MS,
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Momento da audição em milissegundos, ou null se não tiver data.
 * Prefere `date_uts` (número, em SEGUNDOS); usa `date_iso` como alternativa.
 * `nowplaying`, `null` e `"nowplaying"` dão null.
 */
export function timestampScrobble(s: Scrobble): number | null {
  if (s.nowplaying) return null;
  if (typeof s.date_uts === "number" && Number.isFinite(s.date_uts)) return s.date_uts * 1000;
  if (s.date_iso && s.date_iso !== "nowplaying") {
    const ms = Date.parse(s.date_iso);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

/** Data da audição, ou null se não a tiver. */
export function parseDataScrobble(s: Scrobble): Date | null {
  const ms = timestampScrobble(s);
  return ms === null ? null : new Date(ms);
}

/**
 * Data da audição MAIS RECENTE: a âncora de todos os períodos.
 * "Últimas 24 horas" conta a partir daqui, não a partir de agora.
 * Array vazio (ou sem datas) → null.
 */
export function dataDeReferencia(scrobbles: Scrobble[]): Date | null {
  let max: number | null = null;
  for (const s of scrobbles) {
    const ms = timestampScrobble(s);
    if (ms !== null && (max === null || ms > max)) max = ms;
  }
  return max === null ? null : new Date(max);
}

/** "7d" → 604 800 000 ms. "tudo" → null. */
export function duracaoDoPeriodoMs(periodo: Periodo): number | null {
  return periodo === "tudo" ? null : DURACAO_MS[periodo];
}

/** referência − duração. "tudo" → null. */
export function inicioDoPeriodo(periodo: Periodo, referencia: Date): Date | null {
  const duracao = duracaoDoPeriodoMs(periodo);
  return duracao === null ? null : new Date(referencia.getTime() - duracao);
}

/** Hora do dia em UTC (0–23). */
export function horaUTC(data: Date): number {
  return data.getUTCHours();
}

/** Ano-mês em UTC: "2024-03". Ordena-se cronologicamente por ordem alfabética. */
export function chaveDoMes(data: Date): string {
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${data.getUTCFullYear()}-${mes}`;
}

/** Mês seguinte a uma chave: "2024-12" → "2025-01". */
export function proximoMes(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  return mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, "0")}`;
}

/**
 * Todas as chaves de mês entre duas, inclusive: ("2024-11", "2025-02")
 * → ["2024-11", "2024-12", "2025-01", "2025-02"].
 * Serve para preencher meses vazios com 0 nos gráficos.
 */
export function mesesEntre(primeiro: string, ultimo: string): string[] {
  if (primeiro > ultimo) return [];
  const meses: string[] = [];
  for (let m = primeiro; m <= ultimo; m = proximoMes(m)) meses.push(m);
  return meses;
}

// ---------------------------------------------------------------------------
// Apresentação (texto para o utilizador). Separadas dos cálculos.
// ---------------------------------------------------------------------------

/** "8 nov 2026" */
export function formatarData(data: Date): string {
  return `${data.getUTCDate()} ${MESES[data.getUTCMonth()]} ${data.getUTCFullYear()}`;
}

/** "8 nov 2026, 01:08 UTC" (para as últimas audições). */
export function formatarDataHora(data: Date): string {
  const h = String(data.getUTCHours()).padStart(2, "0");
  const m = String(data.getUTCMinutes()).padStart(2, "0");
  return `${formatarData(data)}, ${h}:${m} UTC`;
}

/** "2024-03" → "mar 2024" */
export function formatarMes(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  return `${MESES[mes - 1]} ${ano}`;
}

/** "03h" (eixo do gráfico 24h). */
export function formatarHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}h`;
}
