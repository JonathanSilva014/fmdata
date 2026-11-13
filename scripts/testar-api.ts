/**
 * Etapa 2 do guia: explorar a API antes de escrever o resto.
 *
 * Correr na raiz do projeto:
 *   npx tsx scripts/testar-api.ts
 *
 * O que faz:
 *  - confirma que a API está acordada
 *  - guarda a amostra em scripts/amostra.json (para testar as funções puras)
 *  - mede /scrobbles (n.º de registos, tempo, tamanho → decide a cache)
 *  - testa /artist-info com um artista que existe, um que não existe e sem nome
 *  - testa /album-info e /stats/listening-clock
 *  - procura casos estranhos (datas null, nowplaying, nomes com caracteres especiais)
 */
import { writeFileSync } from "node:fs";
import {
  ApiError,
  obterAlbumInfo,
  obterAmostraScrobbles,
  obterArtistInfo,
  obterHealth,
  obterListeningClock,
  obterScrobbles,
  obterImagemArtista,
} from "../src/services/api";
import { horaDePico, scrobblesPorHora } from "../src/lib/stats";

function titulo(texto: string) {
  console.log(`\n=== ${texto} ===`);
}

function falha(e: unknown) {
  if (e instanceof ApiError) console.log(`  FALHA ${e.tipo} (${e.status ?? "-"}): ${e.message}`);
  else console.log("  FALHA", e);
}

async function main() {
  titulo("/health");
  try {
    const t0 = Date.now();
    console.log("  OK", await obterHealth(), `(${Date.now() - t0} ms)`);
  } catch (e) {
    falha(e);
    return;
  }

  titulo("/scrobbles/amostra");
  try {
    const amostra = await obterAmostraScrobbles();
    writeFileSync("scripts/amostra.json", JSON.stringify(amostra, null, 2));
    console.log(`  OK ${amostra.length} registos → guardados em scripts/amostra.json`);
    console.log("  Primeiro registo:", amostra[0]);
  } catch (e) {
    falha(e);
  }

  titulo("/scrobbles");
  let todos: Awaited<ReturnType<typeof obterScrobbles>> = [];
  try {
    const t0 = Date.now();
    todos = await obterScrobbles();
    const kb = Math.round(JSON.stringify(todos).length / 1024);
    console.log(`  OK ${todos.length} registos em ${Date.now() - t0} ms, ~${kb} KB`);
    console.log(
      kb > 4000
        ? "  AVISO: Demasiado grande para localStorage (~5 MB): não persistir os scrobbles completos."
        : "  OK Cabe em localStorage.",
    );

    const semData = todos.filter((s) => s.date_uts === null).length;
    const aTocar = todos.filter((s) => s.nowplaying).length;
    const semTags = todos.filter((s) => !s.tags.trim()).length;
    const semAlbum = todos.filter((s) => !s.album_name.trim()).length;
    const amados = todos.filter((s) => s.loved === 1).length;
    console.log({ semData, aTocar, semTags, semAlbum, amados });

    const especiais = [...new Set(todos.map((s) => s.artist_name))]
      .filter((n) => /[^a-zA-Z0-9 ]/.test(n))
      .slice(0, 15);
    console.log("  Artistas com caracteres especiais (para testar links):", especiais);
  } catch (e) {
    falha(e);
  }

  const artista = todos[0]?.artist_name ?? "Radiohead";
  const album = todos.find((s) => s.artist_name === artista && s.album_name)?.album_name;

  titulo(`/artist-info → "${artista}" (deve existir)`);
  try {
    const info = await obterArtistInfo(artista);
    console.log("  OK", { ...info, bio_content: `${info.bio_content.slice(0, 80)}…` });
  } catch (e) {
    falha(e);
  }

  titulo("/artist-info → artista inventado (esperado: not-found / 404)");
  try {
    await obterArtistInfo("zzz-artista-que-nao-existe-123");
    console.log("  AVISO: Não deu 404. Ver o que a API devolve neste caso.");
  } catch (e) {
    falha(e);
  }

  titulo("/artist-info → sem nome (esperado: bad-request)");
  try {
    await obterArtistInfo("   ");
  } catch (e) {
    falha(e);
  }

  if (album) {
    titulo(`/album-info → "${artista}" / "${album}"`);
    try {
      const info = await obterAlbumInfo(artista, album);
      console.log("  OK track_count:", info.track_count);
      console.log("  OK tracklist_names:", info.tracklist_names.split(";").map((t) => t.trim()));
    } catch (e) {
      falha(e);
    }
  }

  titulo("/stats/listening-clock vs scrobblesPorHora() de lib/stats.ts");
  try {
    const daApi = await obterListeningClock();
    const nossas = scrobblesPorHora(todos);
    const diferentes = daApi.filter((h) => nossas[h.hour] !== h.scrobbles);
    console.log("  API:   ", daApi.map((h) => h.scrobbles).join(" "));
    console.log("  lib/:  ", nossas.join(" "));
    console.log(
      diferentes.length === 0
        ? `  OK As 24 horas batem certo. Hora de pico: ${horaDePico(nossas)}h UTC`
        : `  FALHA ${diferentes.length} hora(s) diferentes: ${diferentes.map((h) => h.hour).join(", ")}`,
    );
  } catch (e) {
    falha(e);
  }

  titulo(`/artist-image → "${artista}"`);
  try {
    console.log("  OK", await obterImagemArtista(artista));
  } catch (e) {
    falha(e);
  }

  console.log(
    "\nSe algum pedido deu bad-request (400), corrige os nomes em PARAM (services/api.ts) segundo o /docs.",
  );
}

main();
