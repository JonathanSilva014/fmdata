import { useId } from "react";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import type { Periodo } from "@/types";

export const OPCOES_PERIODO: { valor: Periodo; rotulo: string; frase: string }[] = [
  { valor: "tudo", rotulo: "Tudo", frase: "desde o início" },
  { valor: "30d", rotulo: "30 dias", frase: "nos últimos 30 dias" },
  { valor: "14d", rotulo: "14 dias", frase: "nos últimos 14 dias" },
  { valor: "7d", rotulo: "7 dias", frase: "nos últimos 7 dias" },
  { valor: "24h", rotulo: "24 horas", frase: "nas últimas 24 horas" },
];

/**
 * O filtro de período: tudo, últimos 30, 14, 7 dias ou 24 horas.
 * Cada secção do dashboard tem o seu (no cabeçalho do Bloco); `seccao` dá nome
 * ao grupo para os leitores de ecrã ("Período: Top 20 artistas").
 * O tamanho da letra segue o espaço que o filtro tem (container query), não o ecrã.
 */
export function FiltroPeriodo({
  periodo,
  onMudar,
  seccao,
}: {
  periodo: Periodo;
  onMudar: (p: Periodo) => void;
  seccao: string;
}) {
  const rotulo = useId();
  return (
    <div className="@container flex items-center gap-2">
      <span id={rotulo} className="inline-flex shrink-0 items-center text-destaque">
        <ClockCircleIcon size={20} aria-hidden="true" />
        <span className="sr-only">Período: {seccao}</span>
      </span>
      <div role="group" aria-labelledby={rotulo} className="grid flex-1 grid-cols-5 gap-1 @md:gap-1.5">
        {OPCOES_PERIODO.map(({ valor, rotulo: texto }) => {
          const ativo = valor === periodo;
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={ativo}
              onClick={() => onMudar(valor)}
              className={`min-h-10 border px-1 text-xs whitespace-nowrap transition @md:px-2 @md:text-sm ${
                ativo
                  ? "border-destaque bg-destaque font-bold text-sobre-destaque shadow-[0_4px_12px_rgb(200_30_38/0.4)]"
                  : "border-destaque/50 bg-superficie text-destaque hover:bg-superficie-alta"
              }`}
            >
              {texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
