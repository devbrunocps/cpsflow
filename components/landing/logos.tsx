const brands = ["Nexora", "Loovi", "Clínica Vida", "AutoPrime", "EduMais", "Belle Spa"];

export function Logos() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
          Empresas que escalam o atendimento com o CPSFLOW
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {brands.map((b) => (
            <span
              key={b}
              className="text-lg font-bold tracking-tight text-slate-500/70 transition-colors hover:text-slate-300"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
