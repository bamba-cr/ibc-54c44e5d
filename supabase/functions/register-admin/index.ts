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
        JSON.stringify({ error: 'Apenas administradores podem cadastrar novos administradores' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter dados do novo admin
    const { email, password, full_name, username } = await req.json();

    // Validar dados
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
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

    // Criar usuário no auth
    const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: full_name || '',
        username: username || email.split('@')[0],
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      
      // Mensagens de erro mais amigáveis
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
        is_admin: true,
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
      })
      .eq('user_id', newUser.user.id);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
    }

    // Adicionar role de admin
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('Error adding admin role:', roleError);
      
      // Se falhar ao adicionar role, deletar o usuário criado
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao atribuir permissões de administrador' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Registrar log de auditoria
    const { error: auditError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        target_user_id: newUser.user.id,
        action: 'CREATE',
        entity_type: 'admin',
        entity_id: newUser.user.id,
        new_values: {
          email,
          full_name,
          username,
          is_admin: true,
        },
        changed_fields: ['email', 'full_name', 'username', 'is_admin', 'status'],
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });

    if (auditError) {
      console.error('Error logging audit:', auditError);
    }

    console.log('Admin created successfully:', {
      id: newUser.user.id,
      email: newUser.user.email,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: full_name || '',
          username: username || email.split('@')[0],
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
