
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dados temporários para construir a interface
const activity = [
  { day: "Seg", plays: 120 },
  { day: "Ter", plays: 185 },
  { day: "Qua", plays: 150 },
  { day: "Qui", plays: 240 },
  { day: "Sex", plays: 195 },
  { day: "Sáb", plays: 310 },
  { day: "Dom", plays: 275 },
];

const songs = [
  {
    id: 1,
    name: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    plays: 245,
  },
  {
    id: 2,
    name: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    album: "MAYHEM",
    plays: 198,
  },
  {
    id: 3,
    name: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    plays: 172,
  },
  {
    id: 4,
    name: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    plays: 156,
  },
  {
    id: 5,
    name: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    plays: 143,
  },
];

const stats = [
  { label: "Total de audições", value: "12.480", icon: "♫" },
  { label: "Artistas ouvidos", value: "342", icon: "🎤" },
  { label: "Álbuns ouvidos", value: "876", icon: "💿" },
  { label: "Músicas diferentes", value: "2.154", icon: "🎧" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8">

        {/* Apresentação */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-900 p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative z-10">
            <p className="mb-3 text-sm font-medium text-violet-300">
              FMData / Music Analytics
            </p>

            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              A tua música,
              <span className="block text-violet-400">
                em números.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-slate-300">
              Explora as tuas estatísticas musicais,
              descobre os artistas favoritos e acompanha
              os teus hábitos de audição.
            </p>

            <span className="mt-6 inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-medium text-violet-200">
              Dashboard musical
            </span>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-violet-500/40"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl text-violet-300">
                {stat.icon}
              </div>

              <p className="text-sm text-slate-400">
                {stat.label}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stat.value}
              </h2>
            </div>
          ))}
        </section>

        {/* Gráfico */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold">
              Atividade musical
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Distribuição de audições durante a semana
            </p>
          </div>

          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activity}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="playsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#8b5cf6"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8b5cf6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#334155"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="plays"
                  name="Audições"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  fill="url(#playsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Ranking de músicas */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Músicas mais ouvidas
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              As músicas com mais reproduções
            </p>
          </div>

          <div className="space-y-2">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-slate-800"
              >
                <span className="w-5 text-center text-sm text-slate-500">
                  {index + 1}
                </span>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-900 text-xl">
                  ♫
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">
                    {song.name}
                  </h3>

                  <p className="truncate text-sm text-slate-400">
                    {song.artist}
                  </p>
                </div>

                <span className="hidden max-w-44 truncate text-sm text-slate-500 md:block">
                  {song.album}
                </span>

                <div className="text-right">
                  <p className="font-semibold text-violet-400">
                    {song.plays}
                  </p>

                  <p className="text-xs text-slate-500">
                    audições
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pb-6 text-center text-xs text-slate-500">
          FMData — Music Analytics Dashboard
        </footer>
      </div>
    </div>
  );
}
