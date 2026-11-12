/**
 * lib/rotas.ts — caminhos da aplicação (funções puras).
 *
 * Os nomes de artista têm espaços, acentos, "&", "+", "/", "'"... Por isso:
 *  - ao CRIAR um link → encodeURIComponent (checklist do enunciado);
 *  - ao LER o parâmetro da rota → decodeURIComponent (useParams devolve-o codificado).
 */

/** "/artistas/Florence%20%2B%20the%20Machine" */
export function caminhoArtista(nome: string): string {
  return `/artistas/${encodeURIComponent(nome)}`;
}

/**
 * Nome do artista a partir do parâmetro [nome] da rota.
 * Se o parâmetro estiver mal codificado (ex.: "%E0%A4%A"), devolve-o tal como veio
 * em vez de rebentar a página.
 */
export function nomeDaRota(parametro: string | string[] | undefined): string {
  const valor = Array.isArray(parametro) ? parametro[0] : parametro;
  if (!valor) return "";
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}
