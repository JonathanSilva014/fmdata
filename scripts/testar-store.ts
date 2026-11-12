/**
 * Testes da store (cache, deduplicação, persistência), sem rede:
 * o `fetch` e o `localStorage` são simulados.
 *
 * Correr na raiz do projeto:
 *   npx tsx scripts/testar-store.ts
 */

// --- localStorage simulado (o Node não tem) --------------------------------
const memoria = new Map<string, string>();
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (k: string) => memoria.get(k) ?? null,
      setItem: (k: string, v: string) => void memoria.set(k, v),
      removeItem: (k: string) => void memoria.delete(k),
    },
  },
});

// --- API simulada: conta os pedidos por caminho -----------------------------
const pedidos: string[] = [];
let respostaArtistInfo: () => Response = () => json({ name: "Adele" });
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json" } });

globalThis.fetch = (async (entrada: string | URL | Request) => {
  const url = new URL(String(entrada));
  pedidos.push(url.pathname + url.search);
  await new Promise((r) => setTimeout(r, 20)); // simula a rede
  if (url.pathname === "/scrobbles") return json([{ track_name: "Hello", artist_name: "Adele" }]);
  if (url.pathname === "/artist-info") {
    if (url.searchParams.get("artist") === "Ninguém") return json({ detail: "Not found" }, 404);
    return respostaArtistInfo();
  }
  if (url.pathname === "/artist-image") return json({ artist: "Adele", image_url: "https://x/adele.jpg" });
  if (url.pathname === "/album-info") return json({ album_name: "25", track_count: 11 });
  return json({}, 404);
}) as typeof fetch;

let falhas = 0;
function verificar(descricao: string, obtido: unknown, esperado: unknown) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) falhas++;
  console.log(ok ? "✓" : "✗", descricao, ok ? "" : `\n    obtido:   ${JSON.stringify(obtido)}\n    esperado: ${JSON.stringify(esperado)}`);
}
const contar = (caminho: string) => pedidos.filter((p) => p.startsWith(caminho)).length;

async function main() {
  // Importa só depois de simular window/fetch.
  const { useStore } = await import("../src/store/useStore");
  const loja = () => useStore.getState();

  console.log("\n=== Cache e deduplicação: scrobbles ===");
  await Promise.all([loja().carregarScrobbles(), loja().carregarScrobbles(), loja().carregarScrobbles()]);
  verificar("3 pedidos em simultâneo → 1 fetch", contar("/scrobbles"), 1);
  verificar("status success", loja().scrobbles.status, "success");
  await loja().carregarScrobbles();
  verificar("com cache → nenhum fetch novo", contar("/scrobbles"), 1);

  console.log("\n=== Cache e deduplicação: artistas ===");
  await Promise.all([loja().carregarArtista("Adele"), loja().carregarArtista("  adele ")]);
  verificar('"Adele" e "  adele " → 1 fetch (mesma chave)', contar("/artist-info?artist=Adele"), 1);
  verificar("perfil guardado", loja().artistas["adele"]?.data?.name, "Adele");

  await loja().carregarArtista("Ninguém");
  verificar("404 → status not-found (não error)", loja().artistas["ninguém"]?.status, "not-found");
  await loja().carregarArtista("Ninguém");
  verificar("not-found fica em cache → sem novo fetch", contar("/artist-info?artist=Ningu"), 1);

  respostaArtistInfo = () => json({}, 500);
  await loja().carregarArtista("Beyoncé");
  verificar("500 → status error com mensagem", [loja().artistas["beyoncé"]?.status, loja().artistas["beyoncé"]?.error], ["error", "A API respondeu com erro 500."]);
  respostaArtistInfo = () => json({ name: "Beyoncé" });
  await loja().carregarArtista("Beyoncé");
  verificar("depois de um erro, volta a tentar", loja().artistas["beyoncé"]?.status, "success");

  console.log("\n=== Imagens e álbuns ===");
  await Promise.all([loja().carregarImagemArtista("Adele"), loja().carregarImagemArtista("ADELE")]);
  verificar("foto: 1 fetch para 2 pedidos", contar("/artist-image"), 1);
  verificar("foto guardada", loja().imagensArtistas["adele"]?.data, "https://x/adele.jpg");
  await loja().carregarAlbum("Adele", "25");
  await loja().carregarAlbum("adele", " 25");
  verificar("álbum: 1 fetch (mesma chave)", contar("/album-info"), 1);

  console.log("\n=== Persistência (localStorage) ===");
  loja().setPeriodo("7d");
  const guardado = JSON.parse(memoria.get("fmdata") ?? "{}").state ?? {};
  verificar("guarda o período", guardado.periodo, "7d");
  verificar("NÃO guarda os scrobbles (~25 MB)", "scrobbles" in guardado, false);
  verificar("guarda perfis com resposta (success e not-found)", Object.keys(guardado.artistas).sort(), ["adele", "beyoncé", "ninguém"]);
  verificar("guarda fotos e álbuns", [Object.keys(guardado.imagensArtistas), Object.keys(guardado.albuns)], [["adele"], ["adele::25"]]);

  console.log("\n=== Reidratação (simula um refresh) ===");
  // Simula abrir a página de novo: memória limpa, localStorage intacto.
  const noDisco = memoria.get("fmdata") as string;
  useStore.setState({ periodo: "tudo", artistas: {}, albuns: {}, imagensArtistas: {} });
  memoria.set("fmdata", noDisco); // o setState acima também grava; repõe o que estava
  await useStore.persist.rehydrate();
  verificar("período volta", loja().periodo, "7d");
  verificar("perfil volta sem novo fetch", loja().artistas["adele"]?.data?.name, "Adele");
  const antes = contar("/artist-info");
  await loja().carregarArtista("Adele");
  verificar("depois do refresh, Adele vem da cache", contar("/artist-info"), antes);

  console.log(falhas === 0 ? "\nTudo certo ✓" : `\n${falhas} teste(s) falharam ✗`);
  process.exit(falhas === 0 ? 0 : 1);
}

main();
