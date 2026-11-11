# Warmi Segura

**Open-source AI safety companion for adolescent girls in Peru.**
*Warmi* means "woman" in Quechua.

Warmi Segura helps adolescents (12–17) recognise warning signs of gender-based violence, school bullying, sexual harassment and online risks (grooming, sextortion, non-consensual image sharing, controlling partners), and guides them to a trusted adult and to official Peruvian help services (Línea 100 – MIMP, Police 105, SíseVe – MINEDU).

Built by **CEDHINFO** (Peruvian data & tech training company, since 2017) with **Ayni Educativo** (Peruvian non-profit, implementer of the *Escuelas Sin Violencia* school programme). CEDHINFO and Ayni Educativo are related organisations (shared leadership).

## Status
Early functional prototype (November 2026). Being tested with adult educators, psychologists and volunteers using fictional cases only. **Not yet used with minors.**

## Features
- **Chat (`/`)** – Spanish, warm, short answers; never asks for personal data; high-risk detection with an immediate safety banner (105 / Línea 100).
- **AI classification** – every turn returns structured output: topic category, risk level (low/medium/high) and whether it referred to help.
- **Open data panel (`/panel`)** – real-time, public, anonymous counts by topic and risk level. **No message text and no personal data are ever stored.**
- **Tester survey (`/evaluar`)** – anonymous usefulness / clarity / trust ratings.

## Safety & privacy by design
- Message content is processed in memory only and never persisted.
- Only aggregate labels (category, risk, referral) are logged.
- No names, schools, phone numbers or images requested.
- Help resources limited to verified official services.
- Testing protocol: adults only, fictional scenarios; any future use with minors requires parental consent, assent, a safeguarding protocol and supervision by a licensed psychologist (Ayni Educativo).

## Tech
- TanStack Start (React 19) on Cloudflare Workers, hosted on Base44.
- LLM via an OpenAI-compatible gateway (model-agnostic; can be switched to an open-weights model).
- Prompt and classification logic: `src/lib/asistente.js`.
- Data models: `Interaccion` (anonymous label per turn), `Evaluacion` (tester survey).

## Roadmap (12 months)
1. Content validation with Ayni Educativo psychologists and *Escuelas Sin Violencia* facilitators.
2. Supervised pilot in partner public schools in Lima, with consent protocols.
3. WhatsApp channel and Quechua version.
4. Teacher dashboard and referral pathway aligned with school protocols.
5. Open evaluation report.

## License
MIT – see `LICENSE`.
