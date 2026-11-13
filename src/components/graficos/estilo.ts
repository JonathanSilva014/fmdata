/**
 * Estilo comum dos gráficos Recharts, a partir dos tokens do globals.css.
 * O Recharts escreve as cores como atributos SVG, que não percebem var(--…);
 * por isso as cores entram por classes CSS (que se sobrepõem aos atributos)
 * ou por `style` (que percebe variáveis CSS).
 */
export const eixo = {
  tickLine: false,
  axisLine: false,
  tick: { className: "fill-texto-suave text-xs" },
} as const;

export const dica = {
  contentStyle: {
    background: "var(--color-superficie-alta)",
    border: "1px solid var(--color-borda)",
    borderRadius: 8,
    color: "var(--color-texto)",
  },
  labelStyle: { color: "var(--color-texto-suave)" },
  itemStyle: { color: "var(--color-texto)" },
  cursor: { className: "fill-superficie-alta" },
} as const;
