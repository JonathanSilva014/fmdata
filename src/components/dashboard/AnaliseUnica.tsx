import Link from "next/link";
import type { ReactNode } from "react";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { MoonStarsIcon } from "@solar-icons/react/linear/moon-stars";
import { SunriseIcon } from "@solar-icons/react/linear/sunrise";
import { SunIcon } from "@solar-icons/react/linear/sun";
import { MoonIcon } from "@solar-icons/react/linear/moon";
import { agruparPorMomento, PERGUNTA_ANALISE, type ArtistaDeMomento, type MomentoDoDia } from "@/lib/analise";
import { formatarPercentagem, plural } from "@/lib/formatar";
import { caminhoArtista } from "@/lib/rotas";
import { Bloco } from "@/components/ui/Bloco";
import { EstadoVazio } from "@/components/ui/Estados";

/** Nome de cada momento, na linha do tempo. */
const ROTULO: Record<MomentoDoDia, string> = {
  madrugada: "Madrugada",
  manhã: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

/** Ícone Solar de cada momento do dia. */
const ICONE: Record<MomentoDoDia, typeof SunIcon> = {
  madrugada: MoonStarsIcon,
  manhã: SunriseIcon,
  tarde: SunIcon,
  noite: MoonIcon,
};

/** "6" → "06:00" */
const hora = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Um ponto do eixo: cheio se o momento tem artistas; com halo no de mais artistas. */
function Ponto({ cheio, destaque, className = "" }: { cheio: boolean; destaque: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 items-center justify-center rounded-full border-2 border-destaque bg-superficie ${destaque ? "ring-4 ring-destaque/25" : ""} ${className}`}
    >
      {cheio && <span className="size-2 rounded-full bg-destaque" />}
    </span>
  );
}

/**
 * A análise única: a pergunta como título e a resposta numa linha do tempo do dia.
 * Um eixo de horas da meia-noite à meia-noite, com um ponto em cada início de
 * momento (00:00, 06:00, 12:00, 18:00) e o ponto final às 24:00; por baixo de cada
 * troço, os artistas que ouves sobretudo nesse momento. Ponto cheio = há artistas;
 * o momento com mais artistas fica em destaque. Horizontal em ecrãs grandes (lg),
 * vertical no telemóvel e no tablet.
 */
export function AnaliseUnica({ itens, filtro }: { itens: ArtistaDeMomento[]; filtro?: ReactNode }) {
  const momentos = agruparPorMomento(itens);
  const maior = Math.max(...momentos.map((m) => m.artistas.length));

  return (
    <Bloco
      titulo={PERGUNTA_ANALISE}
      icone={<StarsIcon size={22} />}
      descricao="A nossa análise única: artistas com pelo menos 10 reproduções no período que juntam 70% ou mais num só momento do dia (horas UTC)."
      variante="separador"
      filtro={filtro}
    >
      {itens.length === 0 ? (
        <EstadoVazio titulo="Nenhum artista se concentra num só momento do dia">
          Neste período, nenhum artista com 10 ou mais reproduções junta 70% delas no mesmo momento do dia.
        </EstadoVazio>
      ) : (
        <div className="relative">
          <ol className="grid gap-8 lg:grid-cols-4 lg:gap-0">
            {momentos.map((m) => {
              const Icone = ICONE[m.momento];
              const temArtistas = m.artistas.length > 0;
              const destaque = temArtistas && m.artistas.length === maior;
              return (
                <li key={m.momento} className="relative flex min-w-0 flex-col gap-3 pl-9 lg:pr-4 lg:pl-0">
                  {/* No telemóvel, o eixo é vertical: corre pela altura toda do momento até ao seguinte */}
                  <span aria-hidden="true" className="absolute top-2 -bottom-8 left-[9px] w-0.5 bg-destaque lg:hidden" />
                  {/* Etiqueta por cima do eixo (só no momento com mais artistas) */}
                  <span
                    className={`hidden h-6 w-fit items-center bg-destaque px-2.5 font-display text-[11px] font-black tracking-wide text-sobre-destaque uppercase italic lg:inline-flex ${destaque ? "" : "lg:invisible"}`}
                  >
                    Mais artistas
                  </span>

                  {/* Eixo das horas: o troço deste momento e o ponto da hora em que começa */}
                  <div className="relative h-5">
                    <span aria-hidden="true" className="absolute top-1/2 right-0 left-0 hidden h-0.5 -translate-y-1/2 bg-destaque lg:block" />
                    <Ponto cheio={temArtistas} destaque={destaque} className="absolute top-0 -left-9 lg:left-0" />
                    <span className="absolute top-0 left-0 text-xs font-bold text-destaque tabular-nums lg:top-6 lg:-left-1">{hora(m.de)}</span>
                  </div>

                  <h3 className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-destaque lg:mt-5">
                    <ClockCircleIcon size={16} aria-hidden="true" />
                    {hora(m.de)} – {hora(m.ate)}
                    <span className="font-semibold text-texto-suave">· {ROTULO[m.momento]}</span>
                    {destaque && <span className="sr-only"> (momento com mais artistas)</span>}
                  </h3>

                  {!temArtistas ? (
                    <p className="border border-dashed border-borda p-4 text-sm text-texto-suave">Nenhum artista só deste momento.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {m.artistas.map((a) => (
                        <li
                          key={a.artista}
                          className={`relative flex min-w-0 items-start gap-3 border p-3 ${destaque ? "border-destaque bg-superficie-alta/40" : "border-borda"}`}
                        >
                          <div className="min-w-0 flex-1">
                            <Link href={caminhoArtista(a.artista)} className="block truncate font-display text-lg font-black italic hover:text-destaque">
                              {a.artista}
                            </Link>
                            <p className="text-xs text-texto-suave">
                              {a.noMomento} de {plural(a.total, "reprodução", "reproduções")}
                            </p>
                          </div>
                          <span className="shrink-0 font-display font-black tabular-nums text-destaque italic">
                            {formatarPercentagem(a.percentagem)}
                          </span>
                          <Icone size={22} aria-hidden="true" className="absolute right-3 bottom-2 text-destaque/25" />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Ponto final do eixo: meia-noite (24:00). Em baixo no telemóvel, à direita no computador. */}
          <div aria-hidden="true" className="relative mt-8 h-5 pl-9 lg:absolute lg:top-8 lg:right-0 lg:mt-0 lg:pl-0">
            <Ponto cheio={false} destaque={false} className="absolute top-0 left-0 lg:right-0 lg:left-auto" />
            <span className="absolute top-0 left-9 text-xs font-bold whitespace-nowrap text-destaque tabular-nums lg:top-6 lg:right-0 lg:left-auto">24:00</span>
          </div>
        </div>
      )}
    </Bloco>
  );
}
