"use client";

/**
 * Gráfico 24h (dashboard) e relógio 24h (página do artista): o mesmo componente.
 * Barras por hora UTC; a hora de pico fica em destaque.
 * Skill recharts: `responsive` (Recharts ≥ 3.3) em vez de ResponsiveContainer,
 * e `shape` em vez de <Cell> (obsoleto) para pintar a barra de pico.
 */
import { useMemo } from "react";
import { Bar, BarChart, Rectangle, Tooltip, XAxis, YAxis, type BarShapeProps } from "recharts";
import { formatarHora } from "@/lib/dates";
import { formatarNumero } from "@/lib/formatar";
import { dica, eixo } from "./estilo";

export function GraficoHoras({
  porHora,
  pico,
  descricao,
  altura = 240,
}: {
  porHora: number[];
  pico: number | null;
  /** Resumo do gráfico para leitores de ecrã. */
  descricao: string;
  altura?: number;
}) {
  const dados = useMemo(() => porHora.map((audicoes, hora) => ({ hora, audicoes })), [porHora]);

  return (
    <BarChart data={dados} responsive width="100%" height={altura} role="img" aria-label={descricao} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
      <XAxis dataKey="hora" tickFormatter={formatarHora} interval={2} {...eixo} />
      <YAxis width={48} allowDecimals={false} tickFormatter={formatarNumero} {...eixo} />
      <Tooltip
        {...dica}
        labelFormatter={(hora) => `${formatarHora(Number(hora))}–${formatarHora((Number(hora) + 1) % 24)} UTC`}
        formatter={(valor) => [formatarNumero(Number(valor)), "Reproduções"]}
      />
      <Bar
        dataKey="audicoes"
        shape={(props: BarShapeProps) => (
          <Rectangle
            {...props}
            radius={[4, 4, 0, 0]}
            className={props.index === pico ? "fill-(--grafico-pico)" : "fill-(--grafico-barra)"}
          />
        )}
      />
    </BarChart>
  );
}
