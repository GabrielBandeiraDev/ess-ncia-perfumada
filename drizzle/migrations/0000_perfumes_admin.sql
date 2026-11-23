CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE OR REPLACE FUNCTION public.handle_first_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.perfumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  marca text NOT NULL DEFAULT '',
  notas text NOT NULL DEFAULT '',
  ml integer NOT NULL DEFAULT 100,
  preco numeric(10,2) NOT NULL DEFAULT 0,
  categoria text NOT NULL DEFAULT 'Unissex',
  imagem_url text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perfumes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfumes TO authenticated;
GRANT ALL ON public.perfumes TO service_role;
ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON public.perfumes FOR SELECT TO anon, authenticated USING (ativo OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert" ON public.perfumes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update" ON public.perfumes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete" ON public.perfumes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.perfumes (nome, marca, notas, ml, preco, categoria) VALUES
('Rose Éclat','Maison Lune','Rosa, peônia, almíscar',100,489,'Feminino'),
('Velours Rose','Atelier Doré','Baunilha, framboesa, íris',90,559,'Feminino'),
('Fleur de Nuit','Maison Lune','Jasmim, tuberosa, âmbar',100,619,'Feminino'),
('Velvet Oak','Noble House','Carvalho, couro, cardamomo',100,529,'Masculino'),
('Black Cedar','Atelier Doré','Cedro, vetiver, pimenta',100,479,'Masculino'),
('Tabac Royal','Noble House','Tabaco, mel, fava tonka',75,649,'Masculino'),
('Oud Majesty','Dar Al Oud','Oud, rosa, açafrão',100,399,'Árabes'),
('Amber Sultan','Al Sahra','Âmbar, incenso, baunilha',100,349,'Árabes'),
('Layali Gold','Dar Al Oud','Sândalo, oud, praliné',80,429,'Árabes'),
('Lumière','Studio Blanc','Limão siciliano, neroli, chá',100,459,'Unissex'),
('Sel Marin','Studio Blanc','Sal marinho, sálvia, musgo',100,499,'Unissex'),
('Iris Poudre','Atelier Doré','Íris, almíscar branco, cedro',50,389,'Unissex');

CREATE POLICY "perfume imgs read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='perfumes');
CREATE POLICY "perfume imgs admin write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='perfumes' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "perfume imgs admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='perfumes' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "perfume imgs admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='perfumes' AND public.has_role(auth.uid(),'admin'));