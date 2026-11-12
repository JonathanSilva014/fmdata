/**
 * Testes das funções puras de lib/, com a amostra real e com casos limite.
 *
 * Correr na raiz do projeto:
 *   npx tsx scripts/testar-lib.ts
 *
 * Precisa de scripts/amostra.json (gerado por scripts/testar-api.ts).
 */
import { readFileSync } from "node:fs";
import type { Scrobble } from "../src/types";
import {
  chaveDoMes,
  dataDeReferencia,
  duracaoDoPeriodoMs,
  formatarData,
  formatarDataHora,
  formatarMes,
  horaUTC,
  inicioDoPeriodo,
  mesesEntre,
  parseDataScrobble,
  proximoMes,
  temDataValida,
} from "../src/lib/dates";
import {
  filtrarPorArtista,
  filtrarPorPeriodo,
  normalizarNome,
  removerSemData,
  separarLista,
} from "../src/lib/filters";
import {
  contarPor,
  generoMaisOuvido,
  horaDePico,
  paraRanking,
  scrobblesPorHora,
  topAlbuns,
  topArtistas,
  topMusicas,
  totalArtistasDistintos,
  totalScrobbles,
} from "../src/lib/stats";
import {
  albunsDoArtista,
  artistaExiste,
  artistasSemelhantes,
  coberturaDoAlbum,
  resumoDoArtista,
  scrobblesPorMes,
  topMusicasDoArtista,
  ultimasAudicoes,
} from "../src/lib/artist";
import type { AlbumInfo, ArtistInfo } from "../src/types";
import { artistasDeMomento, momentoDaHora } from "../src/lib/analise";
import { caminhoArtista, nomeDaRota } from "../src/lib/rotas";

let falhas = 0;
function verificar(descricao: string, obtido: unknown, esperado: unknown) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) falhas++;
  console.log(ok ? "✓" : "✗", descricao, ok ? "" : `\n    obtido:   ${JSON.stringify(obtido)}\n    esperado: ${JSON.stringify(esperado)}`);
}

/** Scrobble mínimo para os casos limite. */
function s(parcial: Partial<Scrobble>): Scrobble {
  return {
    track_name: "Faixa", artist_name: "Artista", artist_mbid: "", album_name: "Álbum",
    album_mbid: "", track_mbid: "", track_url: "", loved: 0, nowplaying: false,
    tags: "", date_iso: null, date_uts: null, image_url: null, ...parcial,
  };
}

console.log("\n=== dates.ts: casos limite ===");
verificar("nowplaying → null", parseDataScrobble(s({ nowplaying: true, date_uts: 1794100121 })), null);
verificar("date_uts e date_iso null → null", parseDataScrobble(s({})), null);
verificar('date_iso "nowplaying" → null', parseDataScrobble(s({ date_iso: "nowplaying" })), null);
verificar("date_uts em segundos", parseDataScrobble(s({ date_uts: 1794100121 }))?.toISOString(), "2026-11-08T01:08:41.000Z");
verificar("só date_iso", parseDataScrobble(s({ date_iso: "2026-11-08T01:08:41.000Z" }))?.toISOString(), "2026-11-08T01:08:41.000Z");
verificar("date_iso inválida → null", parseDataScrobble(s({ date_iso: "lixo" })), null);
verificar("temDataValida", [temDataValida(s({ date_uts: 1 })), temDataValida(s({}))], [true, false]);
verificar("dataDeReferencia([]) → null", dataDeReferencia([]), null);
verificar("duracao tudo → null", duracaoDoPeriodoMs("tudo"), null);
verificar("duracao 7d", duracaoDoPeriodoMs("7d"), 7 * 24 * 3600 * 1000);
verificar("inicioDoPeriodo tudo → null", inicioDoPeriodo("tudo", new Date(0)), null);
verificar("horaUTC 01:08Z → 1", horaUTC(new Date("2026-11-08T01:08:41Z")), 1);
verificar("chaveDoMes", chaveDoMes(new Date("2024-03-31T23:59:59Z")), "2024-03");
verificar("proximoMes dezembro", proximoMes("2024-12"), "2025-01");
verificar("mesesEntre", mesesEntre("2024-11", "2025-02"), ["2024-11", "2024-12", "2025-01", "2025-02"]);
verificar("mesesEntre invertido → []", mesesEntre("2025-02", "2024-11"), []);
verificar("formatarData", formatarData(new Date("2026-11-08T01:08:41Z")), "8 nov 2026");
verificar("formatarDataHora", formatarDataHora(new Date("2026-11-08T01:08:41Z")), "8 nov 2026, 01:08 UTC");
verificar("formatarMes", formatarMes("2024-03"), "mar 2024");

console.log("\n=== filters.ts: casos limite ===");
verificar("normalizarNome", normalizarNome("  Adele   Adkins "), "adele adkins");
verificar("normalizarNome mantém acentos", normalizarNome("Jão"), "jão");
verificar("separarLista vírgulas", separarLista("rock, indie ,pop,, "), ["rock", "indie", "pop"]);
verificar("separarLista ;", separarLista("Hello; Remedy;River Lea", ";"), ["Hello", "Remedy", "River Lea"]);
verificar("separarLista vazio", separarLista(""), []);
verificar("filtrarPorPeriodo([])", filtrarPorPeriodo([], "24h"), []);
verificar("filtrarPorPeriodo só nowplaying → []", filtrarPorPeriodo([s({ nowplaying: true })], "7d"), []);
verificar("filtrarPorArtista nome vazio → []", filtrarPorArtista([s({})], "  "), []);

console.log("\n=== stats.ts: casos limite ===");
const mini = [
  s({ artist_name: "Adele", track_name: "Hello", album_name: "25", date_uts: 3600 * 1, tags: "Soul, pop" }),
  s({ artist_name: "adele ", track_name: "hello", album_name: "25", date_uts: 3600 * 2, tags: "soul" }),
  s({ artist_name: "Outro", track_name: "Hello", album_name: "", date_uts: 3600 * 2, tags: "rock, Rock" }),
  s({ artist_name: "Zeta", track_name: "Z", album_name: "Z", date_uts: 3600 * 25, tags: "" }),
];
verificar("contarPor ignora chaves vazias", [...contarPor(mini, (x) => x.album_name || null)], [["25", 2], ["Z", 1]]);
verificar("paraRanking ordena e desempata por ordem alfabética",
  paraRanking(new Map([["b", 1], ["a", 1], ["c", 3]])), [{ chave: "c", contagem: 3 }, { chave: "a", contagem: 1 }, { chave: "b", contagem: 1 }]);
verificar("totalScrobbles", totalScrobbles(mini), 4);
verificar("totalArtistasDistintos junta 'Adele' e 'adele '", totalArtistasDistintos(mini), 3);
verificar("topArtistas: Adele 2, imagem null", topArtistas(mini)[0], { chave: "adele", contagem: 2, nome: "Adele", artista: "Adele", imagem: null });
verificar("topMusicas: 'Hello' de artistas diferentes não se juntam", topMusicas(mini).map((m) => [m.subtitulo, m.contagem]), [["Adele", 2], ["Outro", 1], ["Zeta", 1]]);
verificar("topAlbuns ignora álbum vazio", topAlbuns(mini).map((a) => a.nome), ["25", "Z"]);
verificar("topArtistas respeita o limite", topArtistas(mini, 1).length, 1);
verificar("scrobblesPorHora tem 24 posições", scrobblesPorHora([]).length, 24);
verificar("scrobblesPorHora (25h → 1h)", scrobblesPorHora(mini).slice(0, 3), [0, 2, 2]);
verificar("scrobblesPorHora ignora sem data", scrobblesPorHora([s({ nowplaying: true })]).reduce((a, b) => a + b, 0), 0);
verificar("horaDePico em empate → a mais cedo", horaDePico(scrobblesPorHora(mini)), 1);
verificar("horaDePico tudo a 0 → null", horaDePico(new Array(24).fill(0)), null);
verificar("generoMaisOuvido junta maiúsculas e não conta a mesma tag 2× na mesma audição", generoMaisOuvido(mini), { genero: "soul", contagem: 2 });
verificar("generoMaisOuvido sem tags → null", generoMaisOuvido([s({})]), null);

console.log("\n=== artist.ts: casos limite ===");
verificar("artistaExiste ignora maiúsculas", artistaExiste(mini, "ADELE"), true);
verificar("artistaExiste falso", artistaExiste(mini, "Ninguém"), false);
verificar("resumoDoArtista vazio não divide por zero", resumoDoArtista([], []), { total: 0, percentagem: 0, favoritas: 0, primeira: null, ultima: null });
verificar("favoritas conta faixas distintas, não audições",
  resumoDoArtista([s({ loved: 1, track_name: "A", date_uts: 1 }), s({ loved: 1, track_name: "a ", date_uts: 2 }), s({ loved: 1, track_name: "B", date_uts: 3 })], []).favoritas, 2);
verificar("scrobblesPorMes preenche meses vazios com 0",
  scrobblesPorMes([s({ date_iso: "2024-11-05T00:00:00Z" }), s({ date_iso: "2025-02-01T00:00:00Z" }), s({ date_iso: "2025-02-09T00:00:00Z" })]),
  [{ mes: "2024-11", contagem: 1 }, { mes: "2024-12", contagem: 0 }, { mes: "2025-01", contagem: 0 }, { mes: "2025-02", contagem: 2 }]);
verificar("scrobblesPorMes sem datas → []", scrobblesPorMes([s({ nowplaying: true })]), []);
verificar("ultimasAudicoes ignora sem data e ordena", ultimasAudicoes([s({ date_uts: 1, track_name: "velha" }), s({ nowplaying: true }), s({ date_uts: 9, track_name: "nova" })]).map((x) => x.track_name), ["nova", "velha"]);
verificar("apóstrofo curvo = reto", normalizarNome("Don’t You Remember"), "don't you remember");

console.log("\n=== analise.ts: casos limite ===");
verificar("momentoDaHora nos limites", [0, 5, 6, 11, 12, 17, 18, 23].map(momentoDaHora),
  ["madrugada", "madrugada", "manhã", "manhã", "tarde", "tarde", "noite", "noite"]);
const h = (artista: string, hora: number, n: number) =>
  Array.from({ length: n }, (_, i) => s({ artist_name: artista, date_uts: (i * 86400 + hora * 3600) }));
const dadosAnalise = [...h("Noturno", 2, 9), ...h("Noturno", 14, 1), ...h("Dividido", 8, 5), ...h("Dividido", 20, 5), ...h("Poucos", 3, 3), ...h("Manhã", 7, 12)];
verificar("só entram os concentrados (≥70%) com ≥10 audições", artistasDeMomento(dadosAnalise).map((a) => [a.artista, a.momento, Math.round(a.percentagem)]),
  [["Manhã", "manhã", 100], ["Noturno", "madrugada", 90]]);
verificar("opções: mínimo 3 apanha 'Poucos'", artistasDeMomento(dadosAnalise, { minimoAudicoes: 3 }).map((a) => a.artista), ["Manhã", "Poucos", "Noturno"]);
verificar("sem dados → []", artistasDeMomento([]), []);

console.log("\n=== rotas.ts ===");
verificar("caminhoArtista codifica + & / ' e acentos", caminhoArtista("Florence + the Machine & AC/DC's Zé"), "/artistas/Florence%20%2B%20the%20Machine%20%26%20AC%2FDC's%20Z%C3%A9");
verificar("nomeDaRota descodifica", nomeDaRota("Florence%20%2B%20the%20Machine"), "Florence + the Machine");
verificar("ida e volta", nomeDaRota(caminhoArtista("Secos & Molhados").split("/")[2]), "Secos & Molhados");
verificar("parâmetro mal codificado não rebenta", nomeDaRota("%E0%A4%A"), "%E0%A4%A");
verificar("parâmetro vazio", nomeDaRota(undefined), "");

console.log("\n=== Com a amostra real (scripts/amostra.json) ===");
let amostra: Scrobble[];
try {
  amostra = JSON.parse(readFileSync("scripts/amostra.json", "utf-8"));
} catch {
  console.log("✗ Não encontrei scripts/amostra.json. Corre primeiro: npx tsx scripts/testar-api.ts");
  process.exit(1);
}
const comData = removerSemData(amostra);
console.log(`  ${amostra.length} registos, ${comData.length} com data`);

verificar("removerSemData tira 1 (o nowplaying)", amostra.length - comData.length, 1);
verificar("referência = 08/11 01:08:41 UTC", dataDeReferencia(amostra)?.toISOString(), "2026-11-08T01:08:41.000Z");
verificar("24h → 6 audições", filtrarPorPeriodo(amostra, "24h").length, 6);
verificar("24h → 5 Adele + 1 Halsey", filtrarPorPeriodo(amostra, "24h").map((x) => x.artist_name).sort(),
  ["Adele", "Adele", "Adele", "Adele", "Adele", "Halsey"]);
verificar("7d → todas as com data (a mais antiga é de 02/11)", filtrarPorPeriodo(amostra, "7d").length, comData.length);
verificar("tudo → todas as com data", filtrarPorPeriodo(amostra, "tudo").length, comData.length);
verificar("filtrarPorArtista ignora maiúsculas", filtrarPorArtista(amostra, "  ADELE ").length, filtrarPorArtista(amostra, "Adele").length);
verificar("filtrarPorArtista com &", filtrarPorArtista(amostra, "Haute & Freddy").length, 1);
verificar("filtrarPorArtista com acento", filtrarPorArtista(amostra, "jão").length, 8);

const h24 = filtrarPorPeriodo(amostra, "24h");
verificar("24h: hora de pico = 0h (00h e 01h empatam com 3; ganha a mais cedo)", horaDePico(scrobblesPorHora(h24)), 0);
verificar("soma das 24 horas = audições com data", scrobblesPorHora(comData).reduce((a, b) => a + b, 0), comData.length);
verificar("artista n.º 1 = Adele", topArtistas(comData)[0]?.nome, "Adele");
verificar("música n.º 1 = Turning Tables (Adele)", [topMusicas(comData)[0]?.nome, topMusicas(comData)[0]?.subtitulo], ["Turning Tables", "Adele"]);

const adele = filtrarPorArtista(amostra, "Adele");
const resumo = resumoDoArtista(adele, amostra);
verificar("Adele: 31 audições (sem o nowplaying)", resumo.total, 31);
verificar("Adele: 31,3% das 99", Math.round(resumo.percentagem * 10) / 10, 31.3);
verificar("Adele: 0 favoritas (loved é sempre 0)", resumo.favoritas, 0);
verificar("Adele: primeira 02/11 22:24:34", resumo.primeira?.toISOString(), "2026-11-02T22:24:34.000Z");
verificar("Adele: última 08/11 01:08:41", resumo.ultima?.toISOString(), "2026-11-08T01:08:41.000Z");
verificar("Adele: top música = Turning Tables (5)", [topMusicasDoArtista(adele)[0]?.nome, topMusicasDoArtista(adele)[0]?.contagem], ["Turning Tables", 5]);
const albunsAdele = albunsDoArtista(adele);
verificar("Adele: álbuns e plays", albunsAdele.map((a) => [a.nome, a.contagem]), [["21", 14], ["25", 10], ["19", 4], ["30", 2], ["Skyfall", 1]]);
const info25 = { track_count: 11, tracklist_names: "Hello; Send My Love (to Your New Lover); I Miss You; When We Were Young; Remedy; Water Under the Bridge; River Lea; Love in the Dark; Million Years Ago; All I Ask; Sweetest Devotion" } as AlbumInfo;
const album25 = albunsAdele.find((a) => a.nome === "25");
verificar('Adele "25": Ouviste 8 de 11 faixas', album25 && coberturaDoAlbum(album25, info25), { ouvidas: 8, total: 11 });
verificar('Adele "25" sem info do álbum: só X', album25 && coberturaDoAlbum(album25, null), { ouvidas: 8, total: null });
verificar("Adele: tudo em nov 2026", scrobblesPorMes(adele), [{ mes: "2026-11", contagem: 31 }]);
verificar("Adele: última audição = All I Ask", ultimasAudicoes(adele, 1)[0]?.track_name, "All I Ask");
verificar("Adele: semelhantes ouvidos = Sienna Spiro e Amy Winehouse",
  artistasSemelhantes({ similar_artists: "Sam Smith, Whitney Houston, Sienna Spiro, RAYE, Amy Winehouse" } as ArtistInfo, amostra).filter((a) => a.ouvido).map((a) => a.nome),
  ["Sienna Spiro", "Amy Winehouse"]);

console.log("\n  Resumo da amostra (confere à mão):");
console.log("  Totais:", { audicoes: totalScrobbles(comData), artistas: totalArtistasDistintos(comData) });
console.log("  Top 5 artistas:", topArtistas(comData, 5).map((a) => `${a.nome} (${a.contagem})`).join(", "));
console.log("  Top 5 músicas:", topMusicas(comData, 5).map((m) => `${m.nome} – ${m.subtitulo} (${m.contagem})`).join(", "));
console.log("  Top 3 álbuns:", topAlbuns(comData, 3).map((a) => `${a.nome} – ${a.subtitulo} (${a.contagem})`).join(", "));
console.log("  Hora de pico:", horaDePico(scrobblesPorHora(comData)), "UTC");
console.log("  Género mais ouvido:", generoMaisOuvido(comData));
console.log("  Análise única (mín. 5 audições):", artistasDeMomento(comData, { minimoAudicoes: 5 }).map((a) => `${a.artista}: ${Math.round(a.percentagem)}% ${a.momento}`).join(", ") || "nenhum");

console.log(falhas === 0 ? "\nTudo certo ✓" : `\n${falhas} teste(s) falharam ✗`);
process.exit(falhas === 0 ? 0 : 1);
