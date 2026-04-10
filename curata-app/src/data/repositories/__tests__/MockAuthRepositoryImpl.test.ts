import { MockAuthRepositoryImpl } from '../MockAuthRepositoryImpl';

describe('MockAuthRepositoryImpl', () => {
    let repository: MockAuthRepositoryImpl;

    beforeEach(() => {
        repository = new MockAuthRepositoryImpl();
    });

    it('signIn deve retornar usuário e token fake', async () => {
        const result = await repository.signIn('test@curata.com', 'password123');
        expect(result.user.email).toBe('test@curata.com');
        expect(result.token).toContain('mock-token');
    });

    it('signUp deve retornar usuário com nome fornecido', async () => {
        const result = await repository.signUp('test@curata.com', 'pass', 'Nome de Teste');
        expect(result.user.name).toBe('Nome de Teste');
    });

    it('signOut deve limpar usuário e token', async () => {
        await repository.signIn('test@curata.com', 'pass');
        expect(await repository.getCurrentUser()).not.toBeNull();

        await repository.signOut();
        expect(await repository.getCurrentUser()).toBeNull();
        expect(await repository.isTokenValid()).toBe(false);
    });

    it('refreshToken deve gerar novo token se logado', async () => {
        const first = await repository.signIn('test@curata.com', 'pass');

        // Mock Date.now to simulate time passing
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000);

        const token = await repository.refreshToken();
        expect(token).not.toBe(first.token);
        nowSpy.mockRestore();
    }, 10000);

    it('refreshToken deve retornar null se deslogado', async () => {
        expect(await repository.refreshToken()).toBeNull();
    });

    it('getTokenExpiresAt deve retornar data futura se logado', async () => {
        await repository.signIn('a@b.com', 'p');
        const expiry = await repository.getTokenExpiresAt();
        expect(expiry!.getTime()).toBeGreaterThan(Date.now());
    });

    it('getTokenExpiresAt deve retornar null se deslogado', async () => {
        expect(await repository.getTokenExpiresAt()).toBeNull();
    });
});
