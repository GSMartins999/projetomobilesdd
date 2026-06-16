export class AuthErrorHelper {
    static translate(error: any, fallback?: string): string {
        if (!error) return fallback || 'Ocorreu um erro inesperado.';
        
        const message = typeof error === 'string' ? error : error.message || '';
        const status = error.status;

        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials')) {
            return 'E-mail ou senha inválidos.';
        }
        if (lowerMsg.includes('email rate limit exceeded') || lowerMsg.includes('rate limit exceeded') || status === 429) {
            return 'Muitas solicitações. Limite de e-mails excedido. Por favor, tente novamente mais tarde.';
        }
        if (lowerMsg.includes('user already registered') || lowerMsg.includes('already exists') || lowerMsg.includes('email already in use')) {
            return 'Este e-mail já está cadastrado no sistema.';
        }
        if (lowerMsg.includes('password should be at least 6 characters')) {
            return 'A senha deve conter pelo menos 6 caracteres.';
        }
        if (lowerMsg.includes('invalid email') || lowerMsg.includes('email address is invalid') || lowerMsg.includes('email address')) {
            // Check for general invalid email message
            if (lowerMsg.includes('invalid')) {
                return 'Por favor, insira um e-mail válido.';
            }
        }
        if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('connection')) {
            return 'Erro de conexão. Verifique sua conexão de internet.';
        }

        // Return a generic user-friendly message or the original message if it's already user-friendly
        return message || fallback || 'Erro ao realizar autenticação.';
    }
}
