-- Criar tabela de cidades
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  state VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de polos
CREATE TABLE public.polos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  address TEXT,
  phone VARCHAR,
  coordinator_name VARCHAR,
  coordinator_email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, city_id)
);

-- Adicionar coluna polo_id na tabela students
ALTER TABLE public.students ADD COLUMN polo_id UUID REFERENCES public.polos(id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polos ENABLE ROW LEVEL SECURITY;

-- Políticas para cities
CREATE POLICY "Cities são visíveis para todos usuários autenticados" 
ON public.cities 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem gerenciar cities" 
ON public.cities 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Políticas para polos
CREATE POLICY "Polos são visíveis para todos usuários autenticados" 
ON public.polos 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem gerenciar polos" 
ON public.polos 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_polos_updated_at
BEFORE UPDATE ON public.polos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas cidades e polos iniciais como exemplo
INSERT INTO public.cities (name, state) VALUES 
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Salvador', 'BA'),
('Brasília', 'DF');

-- Inserir alguns polos de exemplo
INSERT INTO public.polos (name, city_id, address) 
SELECT 
  'Polo Central',
  id,
  'Endereço Central da cidade'
FROM public.cities 
WHERE name = 'São Paulo';