-- Adicionar campos adicionais na tabela profiles para informações profissionais
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.bio IS 'Biografia ou descrição profissional do usuário';
COMMENT ON COLUMN public.profiles.specialty IS 'Especialidade ou área de atuação do instrutor/coordenador';
COMMENT ON COLUMN public.profiles.birth_date IS 'Data de nascimento do usuário';
COMMENT ON COLUMN public.profiles.address IS 'Endereço completo do usuário';
COMMENT ON COLUMN public.profiles.city IS 'Cidade do usuário';
COMMENT ON COLUMN public.profiles.state IS 'Estado do usuário';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Nome do contato de emergência';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Telefone do contato de emergência';