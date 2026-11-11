import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Marco } from "@/components/Marco";
import { conversar } from "@/lib/asistente";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Warmi Segura · Chat" }] }),
  component: ChatPage,
});

const SUGERENCIAS = [
  "Mi enamorado revisa mi celular y se molesta si hablo con otros",
  "Alguien que conocí en un juego me pide fotos",
  "En el salón se burlan de mí todos los días",
  "Me amenazan con publicar una foto mía",
];

const BIENVENIDA = {
  role: "assistant",
  content:
    "Hola, soy Warmi Segura 💜. Puedes contarme lo que te preocupa: lo que pasa con tu pareja, en el colegio o en internet. No necesito tu nombre ni datos personales. ¿Qué te gustaría contarme?",
};

function ChatPage() {
  const enviar = useServerFn(conversar);
  const [mensajes, setMensajes] = useState([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  async function mandar(contenido) {
    const limpio = contenido.trim().slice(0, 800);
    if (!limpio || cargando) return;
    const nuevos = [...mensajes, { role: "user", content: limpio }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    try {
      const historial = nuevos.filter((m) => m !== BIENVENIDA).slice(-12);
      const r = await enviar({ data: { mensajes: historial } });
      if (r.nivel_riesgo === "alto") setAlerta(true);
      setMensajes([...nuevos, { role: "assistant", content: r.respuesta }]);
    } catch {
      setMensajes([
        ...nuevos,
        { role: "assistant", content: "Uy, tuve un problema para responder. ¿Puedes intentarlo otra vez? Si estás en peligro, llama al 105 o a la Línea 100." },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Marco>
      <section className="mb-4">
        <h1 className="text-2xl font-bold">Hablemos con confianza</h1>
        <p className="text-sm text-[#6B5A80]">
          Te ayudo a reconocer señales de violencia y riesgos en internet, y a encontrar ayuda. No guardo lo que escribes.
        </p>
      </section>

      {alerta && (
        <div className="mb-4 rounded-xl border border-[#F5A3A3] bg-[#FFF1F1] p-3 text-sm text-[#7A1010]">
          <strong>No es tu culpa.</strong> Si estás en peligro ahora, llama al <strong>105</strong> (Policía) o a la <strong>Línea 100</strong> (gratuita).
          Busca a un adulto de confianza.
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-[#E9DDF7] bg-white p-4" style={{ minHeight: 320 }}>
        {mensajes.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-[15px] leading-relaxed " +
                (m.role === "user" ? "bg-[#6D28D9] text-white" : "bg-[#F3ECFC] text-[#1E1033]")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {cargando && <div className="text-sm text-[#6B5A80]">Warmi está escribiendo…</div>}
        <div ref={finRef} />
      </div>

      {mensajes.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => mandar(s)}
              className="rounded-full border border-[#D8C4F2] bg-white px-3 py-1.5 text-left text-sm text-[#4C1D95] hover:bg-[#F3ECFC]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          mandar(texto);
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={800}
          placeholder="Escribe aquí…"
          className="flex-1 rounded-xl border border-[#D8C4F2] bg-white px-4 py-3 text-[15px] outline-none focus:border-[#6D28D9]"
        />
        <button
          type="submit"
          disabled={cargando || !texto.trim()}
          className="rounded-xl bg-[#6D28D9] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿Estás probando el prototipo? <a href="/evaluar" className="font-semibold text-[#6D28D9]">Déjanos tu opinión (1 minuto)</a>
      </p>
    </Marco>
  );
}
