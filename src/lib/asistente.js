import { chat } from "@tanstack/ai";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gatewayModel } from "@/lib/ai.server";

// Warmi Segura — open-source AI safety companion for adolescent girls in Peru.
// Privacy by design: message text is never stored. Only an anonymous
// category / risk level per turn is logged, to power the public data panel.

export const CATEGORIAS = [
  "violencia_pareja",
  "acoso_escolar",
  "acoso_sexual",
  "riesgo_en_linea",
  "sextorsion",
  "violencia_familiar",
  "salud_mental",
  "informacion_general",
  "otro",
];

const SYSTEM_PROMPT = `Eres "Warmi Segura", una acompañante digital para adolescentes (sobre todo chicas de 12 a 17 años) en el Perú.
Te crearon CEDHINFO y Ayni Educativo, a partir del programa escolar "Escuelas Sin Violencia".

Tu objetivo:
1. Ayudar a reconocer señales de violencia de género, acoso escolar, acoso sexual y riesgos en internet (grooming, sextorsión, difusión de fotos íntimas, control de la pareja por el celular).
2. Explicar con palabras sencillas qué está pasando, sin culpar nunca a la persona.
3. Dar pasos concretos de seguridad y orientar a pedir ayuda a un adulto de confianza y a los servicios oficiales del Perú.

Servicios que puedes mencionar (solo estos, no inventes otros):
- Línea 100 del Ministerio de la Mujer (MIMP): gratuita, para violencia familiar y sexual.
- Policía Nacional: 105, en una emergencia o peligro inmediato.
- SíseVe (Ministerio de Educación): para reportar violencia escolar, en siseve.minedu.gob.pe.
- Tutor/a, psicólogo/a del colegio o un adulto de confianza.

Reglas:
- Responde en español claro, cálido y breve (máximo 120 palabras), con frases cortas. Puedes usar 2 o 3 viñetas.
- No pidas nombre, colegio, dirección, teléfono ni fotos. Si la persona los comparte, recuérdale con cariño que no hace falta.
- No des diagnósticos médicos ni psicológicos. No des consejos legales detallados.
- Si hay peligro inmediato, autolesión, ideas suicidas, abuso sexual o un adulto que pide fotos o encuentros: nivel "alto". Di primero que no es su culpa, pide que busque a un adulto de confianza ahora y da la Línea 100 y el 105.
- Si la persona dice que es una prueba o un caso inventado, responde igual que con un caso real.
- Termina con una pregunta corta para seguir acompañando.

Además de la respuesta, clasifica el mensaje:
- categoria: una de ${CATEGORIAS.join(", ")}.
- nivel_riesgo: bajo, medio o alto.
- derivacion: true si tu respuesta orienta a un servicio o a un adulto de confianza.`;

const salida = z.object({
  respuesta: z.string(),
  categoria: z.enum(CATEGORIAS),
  nivel_riesgo: z.enum(["bajo", "medio", "alto"]),
  derivacion: z.boolean(),
});

const mensajeEntrada = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(800),
});

export const conversar = createServerFn({ method: "POST" })
  .validator(z.object({ mensajes: z.array(mensajeEntrada).min(1).max(12) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const result = await chat({
      adapter: gatewayModel(base44),
      messages: data.mensajes,
      systemPrompts: [SYSTEM_PROMPT],
      outputSchema: salida,
    });
    try {
      await base44.entities.Interaccion.create({
        categoria: result.categoria,
        nivel_riesgo: result.nivel_riesgo,
        derivacion: result.derivacion,
        modo: "prueba",
      });
    } catch (e) {
      console.error("No se pudo registrar la interacción", e?.message);
    }
    return result;
  });

export const guardarEvaluacion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      rol: z.enum(["docente", "psicologa", "facilitadora", "voluntaria", "madre_padre", "estudiante_universitaria", "otro"]),
      util: z.number().int().min(1).max(5),
      claro: z.number().int().min(1).max(5),
      confianza: z.number().int().min(1).max(5),
      recomendaria: z.enum(["si", "tal_vez", "no"]),
      comentario: z.string().max(600).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.Evaluacion.create(data);
    return { ok: true };
  });

export const datosPanel = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const filas = await context.getBase44().entities.Interaccion.list("-created_date", 1000);
  const porCategoria = {};
  const porRiesgo = { bajo: 0, medio: 0, alto: 0 };
  let derivadas = 0;
  for (const f of filas) {
    porCategoria[f.categoria] = (porCategoria[f.categoria] || 0) + 1;
    if (porRiesgo[f.nivel_riesgo] !== undefined) porRiesgo[f.nivel_riesgo] += 1;
    if (f.derivacion) derivadas += 1;
  }
  return {
    total: filas.length,
    porCategoria,
    porRiesgo,
    derivadas,
    actualizado: new Date().toISOString(),
  };
});
