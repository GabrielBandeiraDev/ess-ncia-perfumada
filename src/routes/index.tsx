import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarPerfumes } from "@/lib/perfumes-api";
import logo from "@/assets/logo.jpeg.asset.json";
import hero from "@/assets/hero-perfumes.jpg";
import { categorias, formatarPreco, type Categoria } from "@/data/perfumes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Import Frazão — Vitrine de Perfumes Importados" },
      { name: "description", content: "Perfumes importados femininos, masculinos, árabes e unissex. Conheça a vitrine Import Frazão." },
      { property: "og:title", content: "Import Frazão — Perfumes Importados" },
      { property: "og:description", content: "Vitrine de perfumes importados por categoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const imagemDe = (c: string) => categorias.find((x) => x.nome === c)?.imagem ?? categorias[0]!.imagem;

function Index() {
  const [ativa, setAtiva] = useState<Categoria | "Todos">("Todos");
  const { data: perfumes = [], isLoading } = useQuery({ queryKey: ["perfumes"], queryFn: listarPerfumes });
  const lista = ativa === "Todos" ? perfumes : perfumes.filter((p) => p.categoria === ativa);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <a href="#topo" className="flex items-center gap-3">
            <img src={logo.url} alt="Import Frazão" className="h-12 w-12 rounded-full object-cover object-[50%_35%]" />
            <span className="font-display text-2xl tracking-wide text-primary">Import Frazão</span>
          </a>
          <a href="#catalogo" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">Catálogo</a>
        </div>
      </header>

      <section id="topo" className="relative h-[85vh] min-h-[520px] overflow-hidden">
        <img src={hero} alt="Perfumes sobre pedra e seda" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6 text-foreground">
          <p className="rise text-xs uppercase text-primary tracking-[0.5em]">Perfumaria importada</p>
          <h1 className="rise mt-6 max-w-xl font-display text-6xl leading-[0.95] md:text-8xl" style={{ animationDelay: ".15s" }}>
            A assinatura <em className="text-primary">que fica</em>.
          </h1>
          <p className="rise mt-6 max-w-md text-lg font-light opacity-90" style={{ animationDelay: ".3s" }}>
            Fragrâncias selecionadas do mundo todo, para cada momento e personalidade.
          </p>
          <a href="#catalogo" className="rise mt-10 w-fit border border-primary px-8 py-4 text-xs uppercase tracking-[0.3em] text-primary transition hover:bg-primary hover:text-primary-foreground" style={{ animationDelay: ".45s" }}>
            Ver coleção
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-5xl text-foreground">Categorias</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categorias.map((c) => (
            <a key={c.nome} href="#catalogo" onClick={() => setAtiva(c.nome)} className="group relative aspect-[3/4] overflow-hidden">
              <img src={c.imagem} alt={c.nome} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
              <div className="absolute bottom-0 p-5 text-ink-foreground">
                <h3 className="font-display text-3xl">{c.nome}</h3>
                <p className="text-sm font-light opacity-80">{c.descricao}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-20 bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-5xl">Catálogo</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {(["Todos", ...categorias.map((c) => c.nome)] as const).map((n) => (
              <button
                key={n}
                onClick={() => setAtiva(n)}
                className={`px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${ativa === n ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-primary"}`}
              >
                {n}
              </button>
            ))}
          </div>
          {isLoading && <p className="mt-12 text-center text-muted-foreground">Carregando…</p>}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p) => (
              <article key={p.id} className="group rise">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={p.imagem_url || imagemDe(p.categoria)} alt={p.nome} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{p.marca} · {p.categoria}</p>
                <h3 className="mt-1 font-display text-3xl">{p.nome}</h3>
                <p className="text-sm text-muted-foreground">{p.notas} · {p.ml}ml</p>
                <p className="mt-2 text-lg text-primary">{formatarPreco(Number(p.preco))}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-ink py-12 text-center text-ink-foreground">
        <p className="font-display text-3xl">Import Frazão</p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] opacity-60">Perfumes importados</p>
      </footer>
    </div>
  );
}
