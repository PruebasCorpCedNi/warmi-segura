import { Link } from "@tanstack/react-router";

export function Marco({ children }) {
  return (
    <div className="min-h-screen bg-[#FBF7FF] text-[#1E1033]">
      <header className="border-b border-[#E9DDF7] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6D28D9] text-lg font-bold text-white">W</span>
            <span className="text-lg font-semibold text-[#1E1033]">Warmi Segura</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="text-[#6D28D9]">Chat</Link>
            <Link to="/evaluar" className="text-[#6D28D9]">Evaluar</Link>
            <Link to="/panel" className="text-[#6D28D9]">Datos</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 text-xs text-[#6B5A80]">
        Prototipo de código abierto (MIT) de CEDHINFO con Ayni Educativo · No guarda tus mensajes ni datos personales ·
        En una emergencia llama al 105 o a la Línea 100.
      </footer>
    </div>
  );
}
