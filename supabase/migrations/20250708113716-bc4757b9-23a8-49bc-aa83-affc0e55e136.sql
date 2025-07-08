
-- Promover o usuário atual a administrador
UPDATE profiles 
SET 
  is_admin = true,
  status = 'approved'
WHERE user_id = '9eb5dc7e-2995-405e-90a4-b24e1f5df5cd';

-- Inserir role de admin para o usuário (caso não exista)
INSERT INTO user_roles (user_id, role)
VALUES ('9eb5dc7e-2995-405e-90a4-b24e1f5df5cd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
