import Link from "next/link";
import type { ArtistInfo } from "@/types";
import type { EstadoPedido } from "@/hooks/useEntradaEmCache";
import { separarLista } from "@/lib/filters";
import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";
import { Capa } from "@/components/ui/Capa";

/** Cabeçalho: quem é o artista — foto (como fundo), nome, tags e links (dados do perfil). */
export function CabecalhoArtista({ nome, perfil }: { nome: string; perfil: EstadoPedido<ArtistInfo> }) {
  const info = perfil.data;
  const links = info
    ? [
        { rotulo: "Last.fm", url: info.url_lastfm },
        { rotulo: "Wikipedia", url: info.url_wikipedia },
        { rotulo: "MusicBrainz", url: info.url_musicbrainz },
      ].filter((l): l is { rotulo: string; url: string } => Boolean(l.url))
    : [];

  return (
    <section className="papel border-b border-borda-forte">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-10 px-4 pt-6 pb-12 sm:px-6">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-2 text-texto-suave hover:text-texto">
            <ArrowLeftIcon size={18} aria-hidden="true" /> Dashboard
          </Link>
          <h1 className="titulo-display mt-6 text-5xl sm:mt-10 sm:text-6xl md:text-8xl leading-[0.85] text-balance text-destaque lg:text-9xl">
            {info?.name ?? nome}
          </h1>

          {perfil.status === "loading" && (
            <p role="status" className="text-texto-suave">A carregar o perfil…</p>
          )}
          {perfil.status === "not-found" && <p className="text-texto-suave">A Last.fm não tem perfil para este artista.</p>}
          {perfil.status === "error" && (
            <p role="alert" className="text-perigo">
              Não foi possível carregar o perfil.{" "}
              <button type="button" onClick={perfil.recarregar} className="underline">
                Tentar de novo
              </button>
            </p>
          )}

          {info && (
            <>
              <ul aria-label="Tags" className="flex flex-wrap gap-2">
                {separarLista(info.tags).map((tag) => (
                  <li key={tag} className="border-2 border-borda-forte px-3 py-1 font-display text-sm font-extrabold text-destaque uppercase italic">
                    {tag}
                  </li>
                ))}
              </ul>
              <ul aria-label="Links externos" className="flex flex-wrap gap-5">
                {links.map((l) => (
                  <li key={l.rotulo}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 font-extrabold text-destaque hover:text-destaque-claro"
                    >
                      {l.rotulo}
                      <SquareArrowRightUpIcon size={16} aria-hidden="true" />
                      <span className="sr-only">(abre noutro separador)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <Capa
          src={info?.image_url}
          alt={info ? `Foto de ${info.name}` : ""}
          className="aspect-[4/5] w-full max-w-48 flex-[1_1_300px] sm:max-w-sm border-2 border-borda-forte"
        />
      </div>
    </section>
  );
}
