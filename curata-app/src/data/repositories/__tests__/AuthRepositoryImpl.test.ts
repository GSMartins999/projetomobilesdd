import { AuthRepositoryImpl } from '../AuthRepositoryImpl';

// Mocks for expo-secure-store (mapped via moduleNameMapper or manual mock)
const mockSetItem = jest.fn().mockResolvedValue(undefined);
const mockDeleteItem = jest.fn().mockResolvedValue(undefined);
const mockGetItem = jest.fn().mockResolvedValue(null);

jest.mock('expo-secure-store', () => ({
    setItemAsync: (...args: any[]) => mockSetItem(...args),
    deleteItemAsync: (...args: any[]) => mockDeleteItem(...args),
    getItemAsync: (...args: any[]) => mockGetItem(...args),
}));

const makeMockSupabase = (overrides: any = {}) => ({
    auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
            data: {
                user: {
                    id: 'u1',
                    email: 'test@curata.app',
                    user_metadata: { name: 'Test User' },
                },
                session: { access_token: 'jwt-abc' },
            },
            error: null,
        }),
        signUp: jest.fn().mockResolvedValue({
            data: {
                user: {
                    id: 'u2',
                    email: 'new@curata.app',
                    user_metadata: { name: 'Novo' },
                },
                session: { access_token: 'jwt-new' },
            },
            error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({
            data: {
                user: {
                    id: 'u1',
                    email: 'test@curata.app',
                    user_metadata: { name: 'Test User', avatar_url: null },
                },
            },
        }),
        refreshSession: jest.fn().mockResolvedValue({
            data: { session: { access_token: 'jwt-refreshed' } },
            error: null,
        }),
        getSession: jest.fn().mockResolvedValue({
            data: { session: { expires_at: Math.floor(Date.now() / 1000) + 3600 } },
        }),
        ...overrides,
    },
});

describe('AuthRepositoryImpl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('deve retornar user e token quando credenciais válidas', async () => {
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            const result = await repo.signIn('test@curata.app', 'pass123');

            expect(result.user.email).toBe('test@curata.app');
            expect(result.token).toBe('jwt-abc');
            expect(mockSetItem).toHaveBeenCalledWith('curata_jwt', 'jwt-abc');
        });

        it('deve lançar erro quando Supabase retorna error', async () => {
            const supabase = makeMockSupabase({
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: { user: null, session: null },
                    error: { message: 'Invalid login credentials' },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            await expect(repo.signIn('bad@email.com', 'wrong')).rejects.toThrow('Invalid login credentials');
        });

        it('deve lançar erro quando sessão não existe na resposta', async () => {
            const supabase = makeMockSupabase({
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: { user: { id: 'u1' }, session: null },
                    error: null,
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            await expect(repo.signIn('test@curata.app', 'pass')).rejects.toThrow();
        });

        it('deve usar email como fallback de nome se user_metadata.name não existir', async () => {
            const supabase = makeMockSupabase({
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: {
                        user: { id: 'u1', email: 'noname@curata.app', user_metadata: {} },
                        session: { access_token: 'tok' },
                    },
                    error: null,
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);
            const result = await repo.signIn('noname@curata.app', 'p');
            expect(result.user.name).toBe('noname'); // split('@')[0]
        });
    });

    describe('signUp', () => {
        it('deve criar conta e retornar user e token', async () => {
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            const result = await repo.signUp('new@curata.app', 'pass', 'Novo');

            expect(result.user.name).toBe('Novo');
            expect(result.token).toBe('jwt-new');
        });

        it('deve lançar erro quando signUp falha', async () => {
            const supabase = makeMockSupabase({
                signUp: jest.fn().mockResolvedValue({
                    data: { user: null, session: null },
                    error: { message: 'Email already exists' },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            await expect(repo.signUp('dup@curata.app', 'p', 'N')).rejects.toThrow('Email already exists');
        });
    });

    describe('signOut', () => {
        it('deve chamar signOut do Supabase e apagar token local', async () => {
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            await repo.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
            expect(mockDeleteItem).toHaveBeenCalledWith('curata_jwt');
        });
    });

    describe('getCurrentUser', () => {
        it('deve retornar User quando há sessão ativa', async () => {
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            const user = await repo.getCurrentUser();

            expect(user).not.toBeNull();
            expect(user?.email).toBe('test@curata.app');
        });

        it('deve retornar null quando não há usuário logado', async () => {
            const supabase = makeMockSupabase({
                getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const user = await repo.getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe('refreshToken', () => {
        it('deve retornar novo token após refresh e salvar no SecureStore', async () => {
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            const token = await repo.refreshToken();

            expect(token).toBe('jwt-refreshed');
            expect(mockSetItem).toHaveBeenCalledWith('curata_jwt', 'jwt-refreshed');
        });

        it('deve retornar null quando refresh falha', async () => {
            const supabase = makeMockSupabase({
                refreshSession: jest.fn().mockResolvedValue({
                    data: { session: null },
                    error: { message: 'Session expired' },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const token = await repo.refreshToken();
            expect(token).toBeNull();
        });
    });

    describe('isTokenValid', () => {
        it('deve retornar false quando não há token no SecureStore', async () => {
            mockGetItem.mockResolvedValueOnce(null);
            const supabase = makeMockSupabase();
            const repo = new AuthRepositoryImpl(supabase as any);

            const valid = await repo.isTokenValid();
            expect(valid).toBe(false);
        });

        it('deve retornar true quando token existe e session não tem expiração', async () => {
            mockGetItem.mockResolvedValueOnce('some-token');
            const supabase = makeMockSupabase({
                getSession: jest.fn().mockResolvedValue({
                    data: { session: null },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const valid = await repo.isTokenValid();
            expect(valid).toBe(true);
        });

        it('deve retornar true quando token existe e não expirou', async () => {
            mockGetItem.mockResolvedValueOnce('valid-token');
            const futureExp = Math.floor(Date.now() / 1000) + 3600;
            const supabase = makeMockSupabase({
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { expires_at: futureExp } },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const valid = await repo.isTokenValid();
            expect(valid).toBe(true);
        });
    });

    describe('getTokenExpiresAt', () => {
        it('deve retornar Date quando há sessão com expires_at', async () => {
            const futureExp = Math.floor(Date.now() / 1000) + 3600;
            const supabase = makeMockSupabase({
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { expires_at: futureExp } },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const date = await repo.getTokenExpiresAt();
            expect(date).toBeInstanceOf(Date);
            expect(date!.getTime()).toBeGreaterThan(Date.now());
        });

        it('deve retornar null quando não há sessão', async () => {
            const supabase = makeMockSupabase({
                getSession: jest.fn().mockResolvedValue({
                    data: { session: null },
                }),
            });
            const repo = new AuthRepositoryImpl(supabase as any);

            const date = await repo.getTokenExpiresAt();
            expect(date).toBeNull();
        });
    });
});
