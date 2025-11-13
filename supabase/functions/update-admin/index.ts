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
        JSON.stringify({ error: 'Apenas administradores podem editar dados de administradores' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter dados da requisição
    const { user_id, email, full_name, username, password } = await req.json();

    // Obter dados originais do usuário para auditoria
    const { data: originalUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(user_id);
    if (fetchError || !originalUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar dados
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário não está editando a si mesmo (prevenir bloqueio acidental)
    if (currentUser.id === user_id) {
      return new Response(
        JSON.stringify({ error: 'Use a página de perfil para editar seus próprios dados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updateData: any = {
      user_metadata: {},
    };

    // Adicionar campos que foram fornecidos
    if (email) {
      // Validar email
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
      // Validar senha
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

    if (changedFields.length > 0) {
      const { error: auditError } = await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: currentUser.id,
          target_user_id: user_id,
          action: 'UPDATE',
          entity_type: 'admin',
          entity_id: user_id,
          old_values: oldValues,
          new_values: newValues,
          changed_fields: changedFields,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
        });

      if (auditError) {
        console.error('Error logging audit:', auditError);
      }
    }

    console.log('Admin updated successfully:', {
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

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
