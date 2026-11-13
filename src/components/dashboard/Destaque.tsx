/** Alturas (em %) das barras decorativas ao lado do título: um equalizador parado. */
const BARRAS = [18, 30, 22, 45, 34, 60, 40, 72, 55, 88, 64, 100, 70, 52, 80, 58, 92, 66, 48, 74, 38, 56, 28, 20];

/**
 * Topo do dashboard: papel quadriculado com linhas finas, que passa por baixo do
 * cabeçalho e, ao centro, o cartão com o título "Música" e o subtítulo (a data da
 * última reprodução, de onde contam os períodos).
 */
export function Destaque({ subtitulo }: { subtitulo: string }) {
  return (
    <section className="papel relative -mt-(--altura-cabecalho) overflow-hidden border-b border-borda-forte pt-(--altura-cabecalho)">
      {/* Linhas de desenho técnico (decoração) */}
      <div aria-hidden="true" className="hidden lg:block">
        <div className="absolute top-28 left-10 h-56 w-72 border border-borda" />
        <div className="absolute top-38 left-16 h-px w-60 bg-borda" />
        <div className="absolute top-32 right-14 size-56 rounded-full border border-borda" />
        <div className="absolute top-46 right-28 size-28 rounded-full border border-borda" />
        <div className="absolute right-10 bottom-9 left-10 h-px bg-borda" />
      </div>

      <div className="relative mx-auto flex max-w-7xl justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="relative w-full max-w-3xl">
          {/* Patilhas no topo do cartão (decoração) */}
          <span aria-hidden="true" className="absolute -top-2 left-8 h-4 w-24 rounded-t-lg border-2 border-b-0 border-destaque bg-superficie/90" />
          <span aria-hidden="true" className="absolute -top-2 right-8 h-4 w-32 rounded-t-lg border-2 border-b-0 border-destaque bg-superficie/90" />

          <div className="relative flex flex-col gap-5 rounded-3xl border-2 border-destaque bg-superficie/85 p-5 shadow-[0_0_0_6px_rgb(200_30_38/0.08),0_24px_60px_-12px_rgb(200_30_38/0.45)] backdrop-blur-sm sm:p-8">
            <div>
              <div className="flex items-end gap-3">
                <span aria-hidden="true" className="w-1.5 self-stretch rounded-full bg-destaque sm:w-2" />
                <h1 className="titulo-display text-5xl leading-[0.95] text-destaque sm:text-7xl">Música</h1>
                <div aria-hidden="true" className="ml-auto hidden h-14 flex-1 items-end justify-end gap-1 sm:flex">
                  {BARRAS.map((h, i) => (
                    <span key={i} className="w-1.5 rounded-t-sm bg-destaque/35" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-texto-suave">{subtitulo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
