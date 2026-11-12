"use client";

/**
 * components/artista/ArtistaTeste.tsx — PÁGINA DE TESTE da página do artista.
 *
 * Serve para confirmar que a API, a store e os hooks funcionam com dados reais.
 * Não é o design final: o colega substitui-a pelos componentes definitivos
 * (com Recharts, Solar Icons, etc.). Os dados e os estados já são os finais.
 *
 * Abre, por exemplo: /artistas/Adele · /artistas/Secos%20%26%20Molhados ·
 * /artistas/artista-que-nao-existe
 */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import type { AlbumDoArtista } from "@/types";
import { formatarDataHora, formatarHora, formatarMes } from "@/lib/dates";
import { separarLista } from "@/lib/filters";
import { horaDePico, scrobblesPorHora } from "@/lib/stats";
import {
  albunsDoArtista,
  artistasSemelhantes,
  coberturaDoAlbum,
  resumoDoArtista,
  scrobblesPorMes,
  topMusicasDoArtista,
  ultimasAudicoes,
} from "@/lib/artist";
import { caminhoArtista, nomeDaRota } from "@/lib/rotas";
import { useAlbumInfo } from "@/hooks/useAlbumInfo";
import { useArtistInfo } from "@/hooks/useArtistInfo";
import { useScrobblesDoArtista } from "@/hooks/useScrobblesDoArtista";

export default function ArtistaTeste() {
  const params = useParams<{ nome: string }>();
  const nome = nomeDaRota(params.nome);

  const historico = useScrobblesDoArtista(nome);
  const perfil = useArtistInfo(nome);

  // Cálculos (funções puras de lib/) só quando os dados mudam.
  const { doArtista, todos } = historico;
  const resumo = useMemo(() => resumoDoArtista(doArtista, todos), [doArtista, todos]);
  const musicas = useMemo(() => topMusicasDoArtista(doArtista, 10), [doArtista]);
  const albuns = useMemo(() => albunsDoArtista(doArtista), [doArtista]);
  const porMes = useMemo(() => scrobblesPorMes(doArtista), [doArtista]);
  const porHora = useMemo(() => scrobblesPorHora(doArtista), [doArtista]);
  const ultimas = useMemo(() => ultimasAudicoes(doArtista, 10), [doArtista]);
  const semelhantes = useMemo(
    () => (perfil.data ? artistasSemelhantes(perfil.data, todos) : []),
    [perfil.data, todos],
  );

  // ---- Estados: loading → erro → não encontrado → página ----
  if (historico.status === "loading") {
    return (
      <Pagina>
        <PainelEstado nome={nome} historico={historico.status} perfil={perfil.status} />
        <p className="text-slate-400">
          A carregar o histórico de audições… (são mais de 50 mil; pode demorar alguns segundos,
          ou até 1 minuto se a API estiver a acordar)
        </p>
      </Pagina>
    );
  }

  if (historico.status === "error") {
    return (
      <Pagina>
        <PainelEstado nome={nome} historico={historico.status} perfil={perfil.status} />
        <p className="text-red-400">Não foi possível carregar o histórico: {historico.error}</p>
        <button onClick={historico.recarregar} className="mt-3 rounded bg-violet-600 px-4 py-2">
          Tentar de novo
        </button>
      </Pagina>
    );
  }

  if (!historico.existe) {
    return (
      <Pagina>
        <PainelEstado nome={nome} historico={historico.status} perfil={perfil.status} />
        <h1 className="text-2xl font-bold">Artista não encontrado</h1>
        <p className="mt-2 text-slate-400">
          “{nome}” não aparece no teu histórico de audições.
        </p>
        <Link href="/" className="mt-4 inline-block text-violet-400 underline">
          Voltar ao dashboard
        </Link>
      </Pagina>
    );
  }

  const info = perfil.data;
  const pico = horaDePico(porHora);
  const maxHora = Math.max(1, ...porHora);
  const maxMes = Math.max(1, ...porMes.map((m) => m.contagem));

  return (
    <Pagina>
      <PainelEstado nome={nome} historico={historico.status} perfil={perfil.status} />

      {/* Cabeçalho */}
      <section className="flex flex-col gap-6 sm:flex-row">
        {info?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- página de teste
          <img src={info.image_url} alt={info.name} className="h-40 w-40 rounded-xl object-cover" />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-slate-800 text-4xl">♫</div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{info?.name ?? nome}</h1>
          {perfil.status === "loading" && <p className="text-slate-400">A carregar perfil…</p>}
          {perfil.status === "not-found" && <p className="text-slate-400">Sem perfil na API.</p>}
          {perfil.status === "error" && (
            <p className="text-red-400">
              Erro no perfil: {perfil.error}{" "}
              <button onClick={perfil.recarregar} className="underline">tentar de novo</button>
            </p>
          )}
          {info && (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                {separarLista(info.tags).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs">{tag}</span>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {[info.country_origin, info.year_formed, info.type].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <a href={info.url_lastfm} target="_blank" rel="noreferrer" className="text-violet-400 underline">Last.fm</a>
                {info.url_wikipedia && <a href={info.url_wikipedia} target="_blank" rel="noreferrer" className="text-violet-400 underline">Wikipedia</a>}
                {info.url_musicbrainz && <a href={info.url_musicbrainz} target="_blank" rel="noreferrer" className="text-violet-400 underline">MusicBrainz</a>}
              </div>
              <p className="mt-3 max-w-3xl whitespace-pre-line text-sm text-slate-300">{info.bio_summary}</p>
            </>
          )}
        </div>
      </section>

      {/* Cards de estatísticas */}
      <Secao titulo="Estatísticas">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Cartao rotulo="Audições" valor={resumo.total.toLocaleString("pt-PT")} />
          <Cartao rotulo="Do teu total" valor={`${resumo.percentagem.toFixed(1)}%`} />
          <Cartao rotulo="Favoritas" valor={String(resumo.favoritas)} />
          <Cartao rotulo="Primeira" valor={resumo.primeira ? formatarDataHora(resumo.primeira) : "—"} />
          <Cartao rotulo="Última" valor={resumo.ultima ? formatarDataHora(resumo.ultima) : "—"} />
        </div>
      </Secao>

      {/* Top 10 músicas */}
      <Secao titulo="Top 10 músicas">
        <ol className="space-y-1">
          {musicas.map((m, i) => (
            <li key={m.chave} className="flex items-center gap-3">
              <span className="w-6 text-right text-slate-500">{i + 1}</span>
              {m.imagem && (
                // eslint-disable-next-line @next/next/no-img-element -- página de teste
                <img src={m.imagem} alt="" className="h-8 w-8 rounded" />
              )}
              <span className="flex-1">{m.nome} <span className="text-slate-500">· {m.album}</span></span>
              <span className="text-slate-400">{m.contagem}</span>
            </li>
          ))}
        </ol>
      </Secao>

      {/* Álbuns */}
      <Secao titulo={`Álbuns (${albuns.length})`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {albuns.map((album) => (
            <CartaoAlbum key={album.chave} album={album} />
          ))}
        </div>
      </Secao>

      {/* Scrobbles por mês */}
      <Secao titulo="Scrobbles por mês">
        <div className="space-y-1">
          {porMes.map((p) => (
            <div key={p.mes} className="flex items-center gap-2 text-sm">
              <span className="w-20 text-slate-400">{formatarMes(p.mes)}</span>
              <div className="h-3 rounded bg-violet-500" style={{ width: `${(p.contagem / maxMes) * 100}%` }} />
              <span className="text-slate-400">{p.contagem}</span>
            </div>
          ))}
        </div>
      </Secao>

      {/* Relógio 24h */}
      <Secao titulo={`Relógio 24h (UTC)${pico !== null ? ` · pico às ${formatarHora(pico)}` : ""}`}>
        <div className="flex h-32 gap-1">
          {porHora.map((n, hora) => (
            <div key={hora} className="flex h-full flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={hora === pico ? "w-full rounded-t bg-violet-400" : "w-full rounded-t bg-slate-600"}
                  style={{ height: `${(n / maxHora) * 100}%` }}
                  title={`${formatarHora(hora)}: ${n}`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{hora}</span>
            </div>
          ))}
        </div>
      </Secao>

      {/* Últimas 10 audições */}
      <Secao titulo="Últimas 10 audições">
        <ul className="space-y-1 text-sm">
          {ultimas.map((s) => (
            <li key={`${s.date_uts}-${s.track_name}`} className="flex justify-between gap-4">
              <span>{s.track_name}</span>
              <span className="text-slate-400">{s.date_uts ? formatarDataHora(new Date(s.date_uts * 1000)) : ""}</span>
            </li>
          ))}
        </ul>
      </Secao>

      {/* Artistas semelhantes */}
      <Secao titulo="Artistas semelhantes">
        {semelhantes.length === 0 && <p className="text-slate-400">Sem dados.</p>}
        <div className="flex flex-wrap gap-2">
          {semelhantes.map((a) =>
            a.ouvido ? (
              <Link key={a.nome} href={caminhoArtista(a.nome)} className="rounded-full bg-violet-600 px-3 py-1 text-sm">
                {a.nome}
              </Link>
            ) : (
              <span key={a.nome} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-500">
                {a.nome}
              </span>
            ),
          )}
        </div>
      </Secao>
    </Pagina>
  );
}

// ---------------------------------------------------------------------------
// Peças auxiliares (só desta página de teste)
// ---------------------------------------------------------------------------

function Pagina({ children }: { children: ReactNode }) {
  // Cores explícitas: o globals.css do Next põe o fundo branco e sobrepõe-se ao layout.
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-xs text-slate-400">{rotulo}</p>
      <p className="text-lg font-semibold">{valor}</p>
    </div>
  );
}

/** Cada cartão pede a info do seu álbum (useAlbumInfo dentro do cartão, não num ciclo). */
function CartaoAlbum({ album }: { album: AlbumDoArtista }) {
  const info = useAlbumInfo(album.artista, album.nome);
  const cobertura = coberturaDoAlbum(album, info.data);
  return (
    <div className="flex gap-3 rounded-lg bg-slate-900 p-3">
      {album.imagem && (
        // eslint-disable-next-line @next/next/no-img-element -- página de teste
        <img src={album.imagem} alt="" className="h-16 w-16 rounded" />
      )}
      <div className="text-sm">
        <p className="font-semibold">{album.nome}</p>
        <p className="text-slate-400">{plural(album.contagem, "audição", "audições")}</p>
        <p className="text-slate-400">
          {info.status === "loading"
            ? "A ver o álbum…"
            : cobertura.total !== null
              ? `Ouviste ${cobertura.ouvidas} de ${cobertura.total} faixas`
              : plural(cobertura.ouvidas, "faixa ouvida", "faixas ouvidas")}
        </p>
      </div>
    </div>
  );
}

/** "1 audição" / "3 audições" */
function plural(n: number, singular: string, varias: string): string {
  return `${n} ${n === 1 ? singular : varias}`;
}

/** Painel de diagnóstico: mostra o estado de cada pedido à API. */
function PainelEstado({ nome, historico, perfil }: { nome: string; historico: string; perfil: string }) {
  const cor = (s: string) =>
    s === "success" ? "text-green-400" : s === "loading" ? "text-yellow-400" : s === "not-found" ? "text-orange-400" : "text-red-400";
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-3 text-xs">
      <p className="font-semibold text-slate-300">Página de teste · estado dos pedidos à API</p>
      <p>Artista na rota: <code>{nome || "(vazio)"}</code></p>
      <p>/scrobbles: <span className={cor(historico)}>{historico}</span></p>
      <p>/artist-info: <span className={cor(perfil)}>{perfil}</span></p>
    </div>
  );
}
