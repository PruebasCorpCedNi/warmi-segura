import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Marco } from "@/components/Marco";
import { guardarEvaluacion } from "@/lib/asistente";

export const Route = createFileRoute("/evaluar")({
  ssr: false,
  head: () => ({ meta: [{ title: "Warmi Segura · Evaluar" }] }),
  component: EvaluarPage,
});

const ROLES = [
  ["docente", "Docente"],
  ["psicologa", "Psicóloga/o"],
  ["facilitadora", "Facilitador/a de Escuelas Sin Violencia"],
  ["voluntaria", "Voluntaria/o"],
  ["madre_padre", "Madre o padre de familia"],
  ["estudiante_universitaria", "Estudiante universitaria/o"],
  ["otro", "Otro"],
];

function Escala({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-2 font-medium">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className={
              "h-11 w-11 rounded-full border text-base font-semibold " +
              (value === n ? "border-[#6D28D9] bg-[#6D28D9] text-white" : "border-[#D8C4F2] bg-white text-[#4C1D95]")
            }
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-[#6B5A80]">1 = nada · 5 = mucho</p>
    </div>
  );
}

function EvaluarPage() {
  const guardar = useServerFn(guardarEvaluacion);
  const [f, setF] = useState({ rol: "", util: 0, claro: 0, confianza: 0, recomendaria: "", comentario: "" });
  const [estado, setEstado] = useState("");
  const listo = f.rol && f.util && f.claro && f.confianza && f.recomendaria;

  async function enviar(e) {
    e.preventDefault();
    if (!listo) return;
    setEstado("enviando");
    try {
      const datos = { ...f };
      if (!datos.comentario.trim()) delete datos.comentario;
      await guardar({ data: datos });
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <Marco>
        <div className="rounded-2xl border border-[#E9DDF7] bg-white p-6 text-center">
          <h1 className="text-2xl font-bold">¡Gracias! 💜</h1>
          <p className="mt-2 text-[#6B5A80]">Tu opinión nos ayuda a mejorar Warmi Segura.</p>
        </div>
      </Marco>
    );
  }

  return (
    <Marco>
      <h1 className="text-2xl font-bold">Evalúa el prototipo</h1>
      <p className="mb-4 text-sm text-[#6B5A80]">Anónimo. No pedimos nombre ni datos personales. Usa casos inventados.</p>
      <form onSubmit={enviar} className="space-y-6 rounded-2xl border border-[#E9DDF7] bg-white p-5">
        <div>
          <p className="mb-2 font-medium">¿Cuál es tu rol?</p>
          <select
            value={f.rol}
            onChange={(e) => setF({ ...f, rol: e.target.value })}
            className="w-full rounded-xl border border-[#D8C4F2] bg-white px-3 py-3"
          >
            <option value="">Elige una opción</option>
            {ROLES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <Escala label="¿Qué tan útil te pareció la respuesta?" value={f.util} onChange={(v) => setF({ ...f, util: v })} />
        <Escala label="¿Qué tan clara fue para una adolescente?" value={f.claro} onChange={(v) => setF({ ...f, claro: v })} />
        <Escala label="¿Qué tan segura y confiable te pareció la orientación?" value={f.confianza} onChange={(v) => setF({ ...f, confianza: v })} />
        <div>
          <p className="mb-2 font-medium">¿Se la recomendarías a una adolescente?</p>
          <div className="flex gap-2">
            {[["si", "Sí"], ["tal_vez", "Tal vez"], ["no", "No"]].map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => setF({ ...f, recomendaria: v })}
                className={
                  "rounded-full border px-4 py-2 " +
                  (f.recomendaria === v ? "border-[#6D28D9] bg-[#6D28D9] text-white" : "border-[#D8C4F2] bg-white text-[#4C1D95]")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium">¿Qué mejorarías? (opcional)</p>
          <textarea
            value={f.comentario}
            onChange={(e) => setF({ ...f, comentario: e.target.value.slice(0, 600) })}
            rows={3}
            className="w-full rounded-xl border border-[#D8C4F2] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={!listo || estado === "enviando"}
          className="w-full rounded-xl bg-[#6D28D9] py-3 font-semibold text-white disabled:opacity-50"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar opinión"}
        </button>
        {estado === "error" && <p className="text-sm text-red-700">No se pudo enviar. Intenta otra vez.</p>}
      </form>
    </Marco>
  );
}
