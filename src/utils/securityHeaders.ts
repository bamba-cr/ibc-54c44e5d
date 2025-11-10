// Utilitários para configurar headers de segurança
export const setSecurityHeaders = () => {
  // Verificar se está no navegador
  if (typeof window === 'undefined') return;

  // Content Security Policy (implementar via meta tag se necessário)
  const cspContent = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self' https:",
    "media-src 'self' https:",
    "frame-src 'none'"
  ].join('; ');

  // Adicionar meta tag CSP se não existir
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', cspContent);
    document.head.appendChild(meta);
  }

  // Adicionar outros headers de segurança via meta tags
  const securityMetas = [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ];

  securityMetas.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  });
};

// Detectar e prevenir ataques XSS básicos
export const sanitizeHTML = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// Validar origem da requisição
export const validateOrigin = (allowedOrigins: string[] = []): boolean => {
  if (typeof window === 'undefined') return true;
  
  const currentOrigin = window.location.origin;
  const allowedList = [
    currentOrigin,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://lovable.dev',
    ...allowedOrigins
  ];
  
  return allowedList.includes(currentOrigin);
};

// Detectar tentativas de clickjacking
export const preventClickjacking = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    if (window.top !== window.self) {
      // Possível tentativa de clickjacking
      console.warn('Possível tentativa de clickjacking detectada');
      window.top!.location.href = window.self.location.href;
    }
  } catch (e) {
    // Em caso de erro, redirecionar para página inicial
    window.location.href = '/';
  }
};

// Implementar rate limiting no lado do cliente
interface ClientRateLimit {
  count: number;
  timestamp: number;
}

const clientRateLimits = new Map<string, ClientRateLimit>();

export const clientRateLimit = (
  action: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const key = `${action}_${window.location.pathname}`;
  
  const existing = clientRateLimits.get(key);
  
  if (!existing || now - existing.timestamp > windowMs) {
    clientRateLimits.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (existing.count >= maxRequests) {
    return false;
  }
  
  existing.count++;
  return true;
};

// Limpar dados sensíveis do localStorage periodicamente
export const clearSensitiveData = (): void => {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'private',
    'key'
  ];
  
  Object.keys(localStorage).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      localStorage.removeItem(key);
    }
  });
};

// Monitorar atividade suspeita
export const monitorSuspiciousActivity = (): void => {
  if (typeof window === 'undefined') return;
  
  let suspiciousEvents = 0;
  const threshold = 10;
  
  // Detectar múltiplos cliques rápidos
  let clickCount = 0;
  document.addEventListener('click', () => {
    clickCount++;
    setTimeout(() => clickCount--, 1000);
    
    if (clickCount > 20) {
      suspiciousEvents++;
      console.warn('Atividade suspeita: muitos cliques detectados');
    }
  });
  
  // Detectar mudanças rápidas de URL
  let urlChanges = 0;
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    urlChanges++;
    setTimeout(() => urlChanges--, 5000);
    
    if (urlChanges > 10) {
      suspiciousEvents++;
      console.warn('Atividade suspeita: muitas mudanças de URL');
    }
    
    return originalPushState.apply(this, args);
  };
  
  // Se muito suspeito, limpar dados e redirecionar
  setInterval(() => {
    if (suspiciousEvents > threshold) {
      clearSensitiveData();
      window.location.href = '/';
    }
  }, 30000);
};