import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { listarPerfumes, enviarFoto, type PerfumeRow } from "@/lib/perfumes-api";
import { categorias, formatarPreco } from "@/data/perfumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Import Frazão" },
      { name: "description", content: "Área administrativa do catálogo Import Frazão." },
      { property: "og:title", content: "Admin — Import Frazão" },
      { property: "og:description", content: "Gerencie os perfumes do catálogo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [pronto, setPronto] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setPronto(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!pronto) return null;
  if (!session) return <Login />;
  if (isAdmin === null) return <Centro><p className="text-muted-foreground">Verificando…</p></Centro>;
  if (!isAdmin)
    return (
      <Centro>
        <p className="font-display text-3xl">Sem acesso</p>
        <p className="mt-2 text-muted-foreground">Esta conta não é administradora.</p>
        <Button className="mt-6" variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
      </Centro>
    );
  return <Painel email={session.user.email ?? ""} />;
}

function Centro({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">{children}</div>;
}

function Login() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) toast.error("E-mail ou senha incorretos");
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) toast.error(error.message);
      else toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
    }
    setCarregando(false);
  }

  return (
    <Centro>
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 border border-border bg-card p-8 text-left">
        <h1 className="text-center font-display text-4xl text-primary">Import Frazão</h1>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Área admin</p>
        <div className="space-y-2"><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label>Senha</Label><Input type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={carregando}>{modo === "entrar" ? "Entrar" : "Criar conta"}</Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}>
          {modo === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </Centro>
  );
}

type Form = { id?: string; nome: string; marca: string; notas: string; ml: number; preco: number; categoria: string; imagem_url: string | null; ativo: boolean };
const vazio: Form = { nome: "", marca: "", notas: "", ml: 100, preco: 0, categoria: "Feminino", imagem_url: null, ativo: true };

function Painel({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: listarPerfumes });
  const [form, setForm] = useState<Form | null>(null);
  const [filtro, setFiltro] = useState("Todos");
  const lista = filtro === "Todos" ? perfumes : perfumes.filter((p) => p.categoria === filtro);

  async function excluir(p: PerfumeRow) {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    const { error } = await supabase.from("perfumes").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Perfume excluído");
    qc.invalidateQueries({ queryKey: ["perfumes"] });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="font-display text-2xl text-primary">Import Frazão · Admin</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/">Ver site</Link></Button>
            <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sair</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-4xl">Perfumes <span className="text-muted-foreground">({perfumes.length})</span></h1>
          <Button onClick={() => setForm({ ...vazio })}>+ Novo perfume</Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Todos", ...categorias.map((c) => c.nome)].map((n) => (
            <Button key={n} size="sm" variant={filtro === n ? "default" : "outline"} onClick={() => setFiltro(n)}>{n}</Button>
          ))}
        </div>
        <div className="mt-6 divide-y divide-border border border-border bg-card">
          {lista.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <img src={p.imagem_url || categorias.find((c) => c.nome === p.categoria)?.imagem} alt="" className="h-16 w-16 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl">{p.nome} {!p.ativo && <span className="ml-2 text-xs uppercase text-muted-foreground">(oculto)</span>}</p>
                <p className="truncate text-sm text-muted-foreground">{p.marca} · {p.categoria} · {p.ml}ml</p>
              </div>
              <p className="hidden text-primary sm:block">{formatarPreco(Number(p.preco))}</p>
              <Button size="sm" variant="outline" onClick={() => setForm({ ...p, preco: Number(p.preco) })}>Editar</Button>
              <Button size="sm" variant="ghost" onClick={() => excluir(p)}>Excluir</Button>
            </div>
          ))}
          {lista.length === 0 && <p className="p-8 text-center text-muted-foreground">Nenhum perfume.</p>}
        </div>
      </main>
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-3xl">{form?.id ? "Editar perfume" : "Novo perfume"}</DialogTitle></DialogHeader>
          {form && <Editor form={form} setForm={setForm} onSalvo={() => { setForm(null); qc.invalidateQueries({ queryKey: ["perfumes"] }); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Editor({ form, setForm, onSalvo }: { form: Form; setForm: (f: Form) => void; onSalvo: () => void }) {
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });

  async function foto(file?: File) {
    if (!file) return;
    setEnviando(true);
    try { set("imagem_url", await enviarFoto(file)); } catch (e) { toast.error((e as Error).message); }
    setEnviando(false);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const { id, ...dados } = form;
    const { error } = id ? await supabase.from("perfumes").update(dados).eq("id", id) : await supabase.from("perfumes").insert(dados);
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success("Perfume salvo");
    onSalvo();
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
      <div className="space-y-2"><Label>Nome</Label><Input required value={form.nome} onChange={(e) => set("nome", e.target.value)} /></div>
      <div className="space-y-2"><Label>Marca</Label><Input value={form.marca} onChange={(e) => set("marca", e.target.value)} /></div>
      <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => set("notas", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Preço (R$)</Label><Input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => set("preco", Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Tamanho (ml)</Label><Input type="number" min="1" value={form.ml} onChange={(e) => set("ml", Number(e.target.value))} /></div>
      </div>
      <div className="space-y-2">
        <Label>Categoria</Label>
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Button key={c.nome} type="button" size="sm" variant={form.categoria === c.nome ? "default" : "outline"} onClick={() => set("categoria", c.nome)}>{c.nome}</Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Foto</Label>
        {form.imagem_url && <img src={form.imagem_url} alt="" className="h-32 w-32 object-cover" />}
        <Input type="file" accept="image/*" onChange={(e) => foto(e.target.files?.[0])} />
        {enviando && <p className="text-sm text-muted-foreground">Enviando foto…</p>}
      </div>
      <div className="flex items-center gap-3"><Switch checked={form.ativo} onCheckedChange={(v) => set("ativo", v)} /><Label>Mostrar no site</Label></div>
      <Button type="submit" className="w-full" disabled={salvando || enviando}>{salvando ? "Salvando…" : "Salvar"}</Button>
    </form>
  );
}
