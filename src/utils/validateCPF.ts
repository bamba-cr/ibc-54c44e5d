// Sanitização robusta de inputs
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove < e >
    .trim();
};

// Sanitização para email
export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeInput(email);
  return sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
};

// Sanitização para números/documentos
export const sanitizeDocument = (doc: string): string => {
  return doc.replace(/[^\d.-]/g, '');
};

// Validação de CPF melhorada com detecção de padrões inválidos
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Sanitizar entrada
  const cleanCPF = sanitizeDocument(cpf).replace(/\D/g, '');

  // Verificar se tem exatamente 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verificar se não são todos dígitos iguais (padrão comum de teste)
  const invalidPatterns = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidPatterns.includes(cleanCPF)) return false;

  // Verificar se não é uma sequência numérica simples
  const isSequential = cleanCPF.split('').every((digit, index) => 
    index === 0 || parseInt(digit) === parseInt(cleanCPF[index - 1]) + 1
  );
  if (isSequential) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

// Validação de email mais robusta
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const sanitized = sanitizeEmail(email);
  
  // Regex mais restritiva para email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Verificações adicionais
  if (sanitized.length > 254) return false; // RFC 5321
  if (sanitized.includes('..')) return false; // Pontos consecutivos
  if (sanitized.startsWith('.') || sanitized.endsWith('.')) return false;
  
  return emailRegex.test(sanitized);
};