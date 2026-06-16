import { AuthErrorHelper } from '../AuthErrorHelper';

describe('AuthErrorHelper', () => {
    it('should return a generic message if error is null or empty', () => {
        expect(AuthErrorHelper.translate(null)).toBe('Ocorreu um erro inesperado.');
        expect(AuthErrorHelper.translate(undefined)).toBe('Ocorreu um erro inesperado.');
    });

    it('should translate invalid login credentials', () => {
        const err = { message: 'Invalid login credentials' };
        expect(AuthErrorHelper.translate(err)).toBe('E-mail ou senha inválidos.');
        expect(AuthErrorHelper.translate('invalid credentials')).toBe('E-mail ou senha inválidos.');
    });

    it('should translate email rate limit exceeded', () => {
        const err = { message: 'Email rate limit exceeded', status: 429 };
        expect(AuthErrorHelper.translate(err)).toBe('Muitas solicitações. Limite de e-mails excedido. Por favor, tente novamente mais tarde.');
        
        const err2 = { message: 'rate limit exceeded' };
        expect(AuthErrorHelper.translate(err2)).toBe('Muitas solicitações. Limite de e-mails excedido. Por favor, tente novamente mais tarde.');
    });

    it('should translate user already registered', () => {
        const err = { message: 'User already registered' };
        expect(AuthErrorHelper.translate(err)).toBe('Este e-mail já está cadastrado no sistema.');

        const err2 = { message: 'email already in use' };
        expect(AuthErrorHelper.translate(err2)).toBe('Este e-mail já está cadastrado no sistema.');
    });

    it('should translate password too short error', () => {
        const err = { message: 'Password should be at least 6 characters' };
        expect(AuthErrorHelper.translate(err)).toBe('A senha deve conter pelo menos 6 caracteres.');
    });

    it('should translate invalid email', () => {
        const err = { message: 'Invalid email address' };
        expect(AuthErrorHelper.translate(err)).toBe('Por favor, insira um e-mail válido.');
    });

    it('should translate network connection error', () => {
        const err = { message: 'Failed to fetch' };
        expect(AuthErrorHelper.translate(err)).toBe('Erro de conexão. Verifique sua conexão de internet.');
    });

    it('should fallback to original message if not matched', () => {
        const err = { message: 'Custom unknown database error' };
        expect(AuthErrorHelper.translate(err)).toBe('Custom unknown database error');
    });

    it('should use fallback if error is empty or null', () => {
        expect(AuthErrorHelper.translate(null, 'Fallback Msg')).toBe('Fallback Msg');
        expect(AuthErrorHelper.translate({}, 'Fallback Msg')).toBe('Fallback Msg');
    });
});
