import { supabase } from "@/integrations/supabase/client";

// Interface para controle de rate limiting local (fallback)
interface RateLimitEntry {
  count: number;
  timestamp: number;
  blocked: boolean;
}

// Cache local para rate limiting (backup)
const localRateLimit = new Map<string, RateLimitEntry>();

// Configurações de rate limiting
const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueio
  },
  general: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio
  }
};

// Função para verificar rate limiting no banco
export const checkRateLimit = async (
  email: string, 
  type: 'login' | 'general' = 'general',
  ip?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  try {
    const config = RATE_LIMITS[type];
    
    if (type === 'login') {
      // Verificar no banco de dados
      const { data: isAllowed, error } = await supabase
        .rpc('check_login_rate_limit', { 
          user_email: email, 
          user_ip: ip || 'unknown' 
        });

      if (error) {
        console.error('Erro ao verificar rate limit:', error);
        return fallbackRateLimit(email, type);
      }

      if (!isAllowed) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + config.blockDurationMs
        };
      }

      // Contar tentativas restantes
      const { data: attempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .eq('success', false)
        .gte('attempt_time', new Date(Date.now() - config.windowMs).toISOString());

      const remaining = Math.max(0, config.maxAttempts - (attempts?.length || 0));

      return {
        allowed: true,
        remaining,
        resetTime: Date.now() + config.windowMs
      };
    }

    return fallbackRateLimit(email, type);

  } catch (error) {
    console.error('Erro no rate limiting:', error);
    return fallbackRateLimit(email, type);
  }
};

// Rate limiting local como fallback
const fallbackRateLimit = (
  identifier: string, 
  type: 'login' | 'general'
): { allowed: boolean; remaining: number; resetTime: number } => {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  const entry = localRateLimit.get(key);
  
  if (!entry) {
    localRateLimit.set(key, {
      count: 1,
      timestamp: now,
      blocked: false
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs
    };
  }

  // Verificar se a janela de tempo expirou
  if (now - entry.timestamp > config.windowMs) {
    localRateLimit.set(key, {
      count: 1,
      timestamp: now,
      blocked: false
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs
    };
  }

  // Verificar se está bloqueado
  if (entry.blocked && now - entry.timestamp < config.blockDurationMs) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.timestamp + config.blockDurationMs
    };
  }

  // Incrementar contador
  entry.count++;
  
  // Verificar se excedeu o limite
  if (entry.count > config.maxAttempts) {
    entry.blocked = true;
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + config.blockDurationMs
    };
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.timestamp + config.windowMs
  };
};

// Registrar tentativa de login
export const logLoginAttempt = async (
  email: string, 
  success: boolean, 
  ip?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('log_login_attempt', {
        user_email: email,
        was_successful: success,
        user_ip: ip || 'unknown'
      });

    if (error) {
      console.error('Erro ao registrar tentativa de login:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar tentativa de login:', error);
  }
};

// Limpar cache local periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of localRateLimit.entries()) {
    if (now - entry.timestamp > RATE_LIMITS.general.windowMs * 2) {
      localRateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000); // Limpar a cada 5 minutos