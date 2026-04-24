import { AuthRepository } from '../../repositories/AuthRepository';
import { LoginUseCase } from '../LoginUseCase';
import { User } from '../../entities/User';

const mockUser: User = {
    id: 'u1',
    name: 'Test',
    email: 'test@curata.app',
    avatarUrl: null,
    updatedAt: '2026-01-01',
    syncedAt: '2026-01-01',
};

const makeMockAuthRepository = (): jest.Mocked<AuthRepository> => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
    isTokenValid: jest.fn(),
    getTokenExpiresAt: jest.fn(),
});

describe('LoginUseCase', () => {
    let authRepository: jest.Mocked<AuthRepository>;
    let useCase: LoginUseCase;

    beforeEach(() => {
        authRepository = makeMockAuthRepository();
        useCase = new LoginUseCase(authRepository);
    });

    it('deve realizar login com sucesso e retornar usuário e token', async () => {
        authRepository.signIn.mockResolvedValue({ user: mockUser, token: 'jwt-123' });

        const result = await useCase.execute('test@curata.app', 'password123');

        expect(authRepository.signIn).toHaveBeenCalledWith('test@curata.app', 'password123');
        expect(result.user).toEqual(mockUser);
        expect(result.token).toBe('jwt-123');
    });

    it('deve lançar erro se o repositório falhar', async () => {
        authRepository.signIn.mockRejectedValue(new Error('Credenciais inválidas'));

        await expect(useCase.execute('wrong@email.com', 'wrong'))
            .rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro se e-mail ou senha estiverem vazios', async () => {
        await expect(useCase.execute('', 'pass'))
            .rejects.toThrow('E-mail e senha são obrigatórios');

        await expect(useCase.execute('email@test.com', ''))
            .rejects.toThrow('E-mail e senha são obrigatórios');
    });

    it('deve usar mensagem de erro padrão se erro não tiver mensagem', async () => {
        authRepository.signIn.mockRejectedValue({}); // erro sem .message
        await expect(useCase.execute('a@b.com', 'p'))
            .rejects.toThrow('Erro ao realizar login');
    });
});
