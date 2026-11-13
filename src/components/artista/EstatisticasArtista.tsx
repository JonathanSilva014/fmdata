import type { ArtistInfo, ResumoArtista } from "@/types";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { HeartIcon } from "@solar-icons/react/linear/heart";
import { formatarData } from "@/lib/dates";
import { formatarNumero, formatarPercentagem } from "@/lib/formatar";
import { Capa } from "@/components/ui/Capa";

/**
 * Apresentação: foto redonda, biografia (do perfil) e os cards de estatísticas —
 * total, percentagem, favoritas, primeira e última reprodução.
 */
export function EstatisticasArtista({ resumo, info }: { resumo: ResumoArtista; info: ArtistInfo | null }) {
  const cartoes = [
    { rotulo: "Reproduções", valor: formatarNumero(resumo.total) },
    { rotulo: "Do teu total", valor: formatarPercentagem(resumo.percentagem) },
    { rotulo: "Favoritas", valor: resumo.favoritas === 0 ? "Nenhuma" : formatarNumero(resumo.favoritas), favoritas: true },
    { rotulo: "Primeira reprodução", valor: resumo.primeira ? formatarData(resumo.primeira) : "—" },
    { rotulo: "Última reprodução", valor: resumo.ultima ? formatarData(resumo.ultima) : "—" },
  ];

  return (
    <section aria-labelledby="titulo-estatisticas" className="flex flex-wrap items-center gap-6 sm:gap-10">
      <Capa
        src={info?.image_url}
        alt={info ? `Foto de ${info.name}` : ""}
        className="size-28 rounded-full border-4 border-destaque sm:size-52"
      />
      <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-5">
        {info && (info.bio_summary || info.bio_content) && (
          <p className="max-w-[70ch] text-lg leading-relaxed whitespace-pre-line text-texto">
            {info.bio_summary || info.bio_content}
          </p>
        )}
        <h2 id="titulo-estatisticas" className="titulo-display inline-flex items-center gap-2.5 text-lg text-destaque">
          <GraphUpIcon size={20} aria-hidden="true" /> Estatísticas
        </h2>
        <p className="-mt-3 text-texto-suave">Resumo da tua relação com este artista.</p>
        <dl className="grid grid-cols-2 gap-px border-2 border-borda-forte bg-borda sm:grid-cols-3 lg:grid-cols-5">
          {cartoes.map((c) => (
            <div key={c.rotulo} className="bg-superficie p-3.5 last:odd:col-span-2 sm:last:odd:col-span-1">
              <dt className="flex items-center gap-1.5 text-sm text-texto-suave">
                {c.favoritas && <HeartIcon size={16} aria-hidden="true" />}
                {c.rotulo}
              </dt>
              <dd className="font-display text-2xl font-black tabular-nums italic">{c.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
