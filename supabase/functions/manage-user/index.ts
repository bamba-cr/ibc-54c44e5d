import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verificar autenticação do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !currentUser) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário atual é admin
    const { data: isAdmin } = await supabaseClient
      .rpc('is_admin', { user_uuid: currentUser.id });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem gerenciar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    const { action } = requestBody;

    // Ações disponíveis: create, update, delete
    switch (action) {
      case 'create':
        return await createUser(supabaseClient, requestBody, currentUser, req);
      case 'update':
        return await updateUser(supabaseClient, requestBody, currentUser, req);
      case 'delete':
        return await deleteUser(supabaseClient, requestBody, currentUser, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createUser(supabaseClient: any, body: any, currentUser: any, req: Request) {
  const { email, password, full_name, username, role } = body;

  // Validar dados obrigatórios
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email e senha são obrigatórios' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Email inválido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validar força da senha
  if (password.length < 8) {
    return new Response(
      JSON.stringify({ error: 'A senha deve ter no mínimo 8 caracteres' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validar role (não pode ser admin por esta rota)
  const validRoles = ['user', 'instrutor', 'coordenador'];
  if (role && !validRoles.includes(role)) {
    return new Response(
      JSON.stringify({ error: 'Função inválida. Use: user, instrutor ou coordenador' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Criar usuário no auth
  const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: full_name || '',
      username: username || email.split('@')[0],
    },
  });

  if (createUserError) {
    console.error('Error creating user:', createUserError);
    
    if (createUserError.message.includes('already registered')) {
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado no sistema' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: createUserError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!newUser.user) {
    return new Response(
      JSON.stringify({ error: 'Erro ao criar usuário' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Atualizar perfil para status aprovado
  const { error: updateProfileError } = await supabaseClient
    .from('profiles')
    .update({
      status: 'approved',
      is_admin: false,
      approved_by: currentUser.id,
      approved_at: new Date().toISOString(),
    })
    .eq('user_id', newUser.user.id);

  if (updateProfileError) {
    console.error('Error updating profile:', updateProfileError);
  }

  // Adicionar role do usuário
  const userRole = role || 'user';
  const { error: roleError } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: newUser.user.id,
      role: userRole,
    });

  if (roleError) {
    console.error('Error adding user role:', roleError);
    // Se falhar ao adicionar role, deletar o usuário criado
    await supabaseClient.auth.admin.deleteUser(newUser.user.id);
    
    return new Response(
      JSON.stringify({ error: 'Erro ao atribuir função ao usuário' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Registrar log de auditoria
  await supabaseClient
    .from('audit_logs')
    .insert({
      user_id: currentUser.id,
      target_user_id: newUser.user.id,
      action: 'CREATE',
      entity_type: 'user',
      entity_id: newUser.user.id,
      new_values: {
        email,
        full_name,
        username: username || email.split('@')[0],
        role: userRole,
      },
      changed_fields: ['email', 'full_name', 'username', 'role', 'status'],
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
    });

  console.log('User created successfully:', {
    id: newUser.user.id,
    email: newUser.user.email,
    role: userRole,
  });

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: full_name || '',
        username: username || email.split('@')[0],
        role: userRole,
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateUser(supabaseClient: any, body: any, currentUser: any, req: Request) {
  const { user_id, email, full_name, username, password, role } = body;

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: 'ID do usuário é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verificar se o usuário não está editando a si mesmo
  if (currentUser.id === user_id) {
    return new Response(
      JSON.stringify({ error: 'Use a página de perfil para editar seus próprios dados' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Obter dados originais do usuário para auditoria
  const { data: originalUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(user_id);
  if (fetchError || !originalUser) {
    return new Response(
      JSON.stringify({ error: 'Usuário não encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const updateData: any = {
    user_metadata: { ...originalUser.user.user_metadata },
  };

  // Adicionar campos que foram fornecidos
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    updateData.email = email;
  }

  if (password) {
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter no mínimo 8 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    updateData.password = password;
  }

  if (full_name !== undefined) {
    updateData.user_metadata.full_name = full_name;
  }

  if (username !== undefined) {
    updateData.user_metadata.username = username;
  }

  // Atualizar usuário no auth
  const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(
    user_id,
    updateData
  );

  if (updateError) {
    console.error('Error updating user:', updateError);
    
    if (updateError.message.includes('already registered')) {
      return new Response(
        JSON.stringify({ error: 'Este email já está em uso por outro usuário' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Atualizar tabela profiles se houver mudanças
  const profileUpdates: any = {};
  
  if (email) profileUpdates.email = email;
  if (full_name !== undefined) profileUpdates.full_name = full_name;
  if (username !== undefined) profileUpdates.username = username;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update(profileUpdates)
      .eq('user_id', user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }
  }

  // Atualizar role se fornecido
  if (role) {
    const validRoles = ['user', 'instrutor', 'coordenador'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Função inválida. Use: user, instrutor ou coordenador' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remover roles antigos (exceto admin)
    await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)
      .neq('role', 'admin');

    // Inserir novo role
    await supabaseClient
      .from('user_roles')
      .upsert({
        user_id: user_id,
        role: role,
      });
  }

  // Registrar log de auditoria
  const changedFields: string[] = [];
  const oldValues: any = {};
  const newValues: any = {};

  if (email && email !== originalUser.user.email) {
    changedFields.push('email');
    oldValues.email = originalUser.user.email;
    newValues.email = email;
  }
  if (full_name !== undefined && full_name !== originalUser.user.user_metadata?.full_name) {
    changedFields.push('full_name');
    oldValues.full_name = originalUser.user.user_metadata?.full_name;
    newValues.full_name = full_name;
  }
  if (username !== undefined && username !== originalUser.user.user_metadata?.username) {
    changedFields.push('username');
    oldValues.username = originalUser.user.user_metadata?.username;
    newValues.username = username;
  }
  if (password) {
    changedFields.push('password');
    newValues.password = '***REDACTED***';
  }
  if (role) {
    changedFields.push('role');
    newValues.role = role;
  }

  if (changedFields.length > 0) {
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        target_user_id: user_id,
        action: 'UPDATE',
        entity_type: 'user',
        entity_id: user_id,
        old_values: oldValues,
        new_values: newValues,
        changed_fields: changedFields,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });
  }

  console.log('User updated successfully:', {
    id: user_id,
    email: updatedUser.user.email,
    changedFields,
  });

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        full_name: updatedUser.user.user_metadata?.full_name || '',
        username: updatedUser.user.user_metadata?.username || '',
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteUser(supabaseClient: any, body: any, currentUser: any, req: Request) {
  const { user_id } = body;

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: 'ID do usuário é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verificar se não está deletando a si mesmo
  if (currentUser.id === user_id) {
    return new Response(
      JSON.stringify({ error: 'Você não pode deletar sua própria conta' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verificar se o usuário alvo não é admin
  const { data: isTargetAdmin } = await supabaseClient
    .rpc('is_admin', { user_uuid: user_id });

  if (isTargetAdmin) {
    return new Response(
      JSON.stringify({ error: 'Não é possível deletar outro administrador por esta rota' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Obter dados do usuário para auditoria
  const { data: targetUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(user_id);
  if (fetchError || !targetUser) {
    return new Response(
      JSON.stringify({ error: 'Usuário não encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Deletar dados relacionados antes de deletar o usuário
  // 1. Deletar eventos do usuário
  const { error: deleteEventsError } = await supabaseClient
    .from('events')
    .delete()
    .eq('user_id', user_id);

  if (deleteEventsError) {
    console.error('Error deleting user events:', deleteEventsError);
  }

  // 2. Deletar roles do usuário
  const { error: deleteRolesError } = await supabaseClient
    .from('user_roles')
    .delete()
    .eq('user_id', user_id);

  if (deleteRolesError) {
    console.error('Error deleting user roles:', deleteRolesError);
  }

  // 3. Deletar sessões do usuário
  const { error: deleteSessionsError } = await supabaseClient
    .from('user_sessions')
    .delete()
    .eq('user_id', user_id);

  if (deleteSessionsError) {
    console.error('Error deleting user sessions:', deleteSessionsError);
  }

  // 4. Deletar perfil do usuário (a tabela profiles tem FK para auth.users)
  const { error: deleteProfileError } = await supabaseClient
    .from('profiles')
    .delete()
    .eq('id', user_id);

  if (deleteProfileError) {
    console.error('Error deleting user profile:', deleteProfileError);
  }

  // Também tentar deletar pelo user_id caso o id seja diferente
  const { error: deleteProfileError2 } = await supabaseClient
    .from('profiles')
    .delete()
    .eq('user_id', user_id);

  if (deleteProfileError2) {
    console.error('Error deleting user profile by user_id:', deleteProfileError2);
  }

  // Deletar usuário do auth
  const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id);

  if (deleteError) {
    console.error('Error deleting user:', deleteError);
    return new Response(
      JSON.stringify({ error: 'Erro ao deletar usuário. Verifique se não há dados vinculados.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Registrar log de auditoria
  await supabaseClient
    .from('audit_logs')
    .insert({
      user_id: currentUser.id,
      target_user_id: user_id,
      action: 'DELETE',
      entity_type: 'user',
      entity_id: user_id,
      old_values: {
        email: targetUser.user.email,
        full_name: targetUser.user.user_metadata?.full_name,
        username: targetUser.user.user_metadata?.username,
      },
      changed_fields: ['deleted'],
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
    });

  console.log('User deleted successfully:', {
    id: user_id,
    email: targetUser.user.email,
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Usuário deletado com sucesso',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
