import type { ReactNode } from "react";

const FUNDOS = {
  papel: "papel",
  cinza: "bg-superficie-cinza",
  rosa: "bg-superficie-alta",
  branco: "bg-superficie",
} as const;

/** Banda de largura total com o fundo da maqueta (papel quadriculado, cinza, rosa ou branco). */
export function Faixa({
  fundo = "papel",
  children,
  className = "",
}: {
  fundo?: keyof typeof FUNDOS;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-borda-forte ${FUNDOS[fundo]}`}>
      <div className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 ${className}`}>{children}</div>
    </div>
  );
}
