import Image from "next/image";
import type { ReactNode } from "react";
import type { GeneroContagem } from "@/types";
import { formatarHora } from "@/lib/dates";
import { formatarNumero, plural } from "@/lib/formatar";

/**
 * Totais e género mais ouvido, em palco: a imagem dos auscultadores ao centro,
 * as reproduções por baixo e os outros números nos 4 cantos (em ecrãs pequenos,
 * os cantos passam para uma grelha por baixo da imagem).
 */
export function Palco({
  audicoes,
  artistas,
  genero,
  pico,
  fraseDoPeriodo,
  filtro,
}: {
  audicoes: number;
  artistas: number;
  genero: GeneroContagem | null;
  pico: number | null;
  fraseDoPeriodo: string;
  /** Filtro de período dos totais. */
  filtro?: ReactNode;
}) {
  const cantos = [
    { rotulo: "Artistas distintos", valor: formatarNumero(artistas), lugar: "lg:top-10 lg:left-6" },
    {
      rotulo: "Género mais ouvido",
      valor: genero ? genero.genero : "Sem etiquetas",
      extra: genero ? `em ${plural(genero.contagem, "reprodução", "reproduções")}` : undefined,
      lugar: "lg:top-10 lg:right-6 lg:text-right",
    },
    { rotulo: "Hora de pico", valor: pico !== null ? `${formatarHora(pico)} UTC` : "—", lugar: "lg:bottom-10 lg:left-6" },
    { rotulo: "Período", valor: fraseDoPeriodo, lugar: "lg:right-6 lg:bottom-10 lg:text-right" },
  ];

  return (
    <section aria-labelledby="titulo-totais" className="border-b border-borda-forte bg-superficie">
      <h2 id="titulo-totais" className="sr-only">Totais</h2>
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
        {filtro && <div className="mx-auto mb-6 max-w-sm">{filtro}</div>}
        <Image
          src="/palco-auscultadores.webp"
          alt=""
          width={1774}
          height={887}
          sizes="(min-width: 1024px) 768px, 92vw"
          className="mx-auto h-auto w-full max-w-3xl"
        />
        {/* Centrado e numa só linha; lg:px-56/xl:px-64 deixam livre o espaço dos cantos de baixo
            (que são absolutos), para números grandes ("51 522 reproduções") não os taparem. */}
        <p className="titulo-display mt-4 text-center text-2xl leading-none text-destaque min-[420px]:text-3xl sm:text-4xl lg:px-56 lg:text-3xl xl:px-64 xl:text-5xl">
          <span className="tabular-nums">{formatarNumero(audicoes)}</span> reproduções
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 lg:contents">
          {cantos.map((c) => (
            <div key={c.rotulo} className={`min-w-0 lg:absolute lg:max-w-60 ${c.lugar}`}>
              <dt className="font-display text-xs font-extrabold tracking-wide text-destaque uppercase italic sm:text-sm">{c.rotulo}</dt>
              <dd className="font-display text-xl font-black break-words text-destaque italic first-letter:uppercase sm:text-2xl lg:text-3xl">
                {c.valor}
              </dd>
              {c.extra && <dd className="text-sm text-texto-suave">{c.extra}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
