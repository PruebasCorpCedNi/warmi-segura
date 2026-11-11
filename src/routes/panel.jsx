import { createFileRoute } from "@tanstack/react-router";
import { Marco } from "@/components/Marco";
import { datosPanel } from "@/lib/asistente";

export const Route = createFileRoute("/panel")({
  loader: () => datosPanel(),
  head: () => ({ meta: [{ title: "Warmi Segura · Datos abiertos" }] }),
  component: PanelPage,
});

const NOMBRES = {
  violencia_pareja: "Violencia en la pareja",
  acoso_escolar: "Acoso escolar",
  acoso_sexual: "Acoso sexual",
  riesgo_en_linea: "Riesgos en internet",
  sextorsion: "Sextorsión / fotos íntimas",
  violencia_familiar: "Violencia familiar",
  salud_mental: "Salud mental",
  informacion_general: "Información general",
  otro: "Otro",
};

function PanelPage() {
  const d = Route.useLoaderData() ?? { total: 0, porCategoria: {}, porRiesgo: {}, derivadas: 0 };
  const max = Math.max(1, ...Object.values(d.porCategoria));
  const filas = Object.entries(d.porCategoria).sort((a, b) => b[1] - a[1]);
  return (
    <Marco>
      <h1 className="text-2xl font-bold">Datos abiertos del prototipo</h1>
      <p className="mb-4 text-sm text-[#6B5A80]">
        Conteo anónimo en tiempo real de las conversaciones de prueba. No se guarda ningún mensaje ni dato personal.
      </p>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile n={d.total} t="Conversaciones (turnos)" />
        <Tile n={d.porRiesgo?.alto ?? 0} t="Riesgo alto detectado" />
        <Tile n={d.derivadas} t="Orientadas a ayuda" />
      </div>
      <div className="rounded-2xl border border-[#E9DDF7] bg-white p-4">
        <h2 className="mb-3 font-semibold">Temas consultados</h2>
        {filas.length === 0 && <p className="text-sm text-[#6B5A80]">Aún no hay datos.</p>}
        <div className="space-y-2">
          {filas.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-sm">
                <span>{NOMBRES[k] ?? k}</span>
                <span className="font-semibold">{v}</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3ECFC]">
                <div className="h-2 rounded-full bg-[#6D28D9]" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Marco>
  );
}

function Tile({ n, t }) {
  return (
    <div className="rounded-2xl border border-[#E9DDF7] bg-white p-3 text-center">
      <div className="text-2xl font-bold text-[#6D28D9]">{n}</div>
      <div className="text-xs text-[#6B5A80]">{t}</div>
    </div>
  );
}
