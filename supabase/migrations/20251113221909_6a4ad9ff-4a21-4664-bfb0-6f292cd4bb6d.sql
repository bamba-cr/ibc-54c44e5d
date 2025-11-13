-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os logs
CREATE POLICY "Admins podem ver logs de auditoria"
ON public.audit_logs
FOR SELECT
USING (is_admin());

-- Política: Sistema pode inserir logs (via edge function)
CREATE POLICY "Sistema pode inserir logs de auditoria"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Adicionar comentários
COMMENT ON TABLE public.audit_logs IS 'Registros de auditoria para rastrear alterações no sistema';
COMMENT ON COLUMN public.audit_logs.user_id IS 'Usuário que realizou a ação';
COMMENT ON COLUMN public.audit_logs.target_user_id IS 'Usuário que foi afetado pela ação';
COMMENT ON COLUMN public.audit_logs.action IS 'Tipo de ação realizada (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Tipo de entidade afetada (admin, student, etc)';
COMMENT ON COLUMN public.audit_logs.changed_fields IS 'Lista de campos que foram alterados';