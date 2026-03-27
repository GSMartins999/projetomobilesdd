import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LogoutUseCase } from '../LogoutUseCase';

const makeMockAuthRepository = (): jest.Mocked<AuthRepository> => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
    isTokenValid: jest.fn(),
    getTokenExpiresAt: jest.fn(),
});

describe('LogoutUseCase', () => {
    let authRepository: jest.Mocked<AuthRepository>;
    let useCase: LogoutUseCase;

    beforeEach(() => {
        authRepository = makeMockAuthRepository();
        useCase = new LogoutUseCase(authRepository);
    });

    it('deve realizar logout chamando o repositório', async () => {
        authRepository.signOut.mockResolvedValue();

        await useCase.execute();

        expect(authRepository.signOut).toHaveBeenCalled();
    });

    it('deve repassar erros do repositório', async () => {
        authRepository.signOut.mockRejectedValue(new Error('Network error'));

        await expect(useCase.execute()).rejects.toThrow('Network error');
    });
});
