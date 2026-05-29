import Link from "next/link";
import { Bot } from "lucide-react";

const groups = [
  {
    title: "Produto",
    links: [
      ["Recursos", "#recursos"],
      ["Automação", "#automacao"],
      ["Preços", "#precos"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Sobre", "#"],
      ["Blog", "#"],
      ["Contato", "#"],
      ["Carreiras", "#"],
    ],
  },
  {
    title: "Acesso",
    links: [
      ["Entrar", "/login"],
      ["Criar conta", "/register"],
      ["Suporte", "#"],
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
                <Bot className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                CPS<span className="text-emerald-400">FLOW</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              A plataforma de atendimento com IA que transforma o WhatsApp em uma
              máquina de vendas.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-sm font-semibold text-white">{g.title}</p>
              <ul className="mt-4 space-y-3">
                {g.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 transition-colors hover:text-emerald-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CPSFLOW. Todos os direitos reservados.
          </p>
          <div className="flex gap-5 text-xs text-slate-500">
            <Link href="#" className="hover:text-slate-300">Privacidade</Link>
            <Link href="#" className="hover:text-slate-300">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
