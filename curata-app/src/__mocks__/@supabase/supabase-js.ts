// Mock @supabase/supabase-js
const mockAuthUser = {
    id: 'test-user-id',
    email: 'test@curata.app',
    created_at: '2026-01-01T00:00:00Z',
};

const mockSession = {
    access_token: 'mock-jwt-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: mockAuthUser,
};

const authMock = {
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockAuthUser, session: mockSession }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: mockAuthUser }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    refreshSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
};

const fromMock = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
});

const storageMock = {
    from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test/photo.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://storage.supabase.co/test/photo.jpg' } }),
        remove: jest.fn().mockResolvedValue({ data: [], error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
};

const mockClient = {
    auth: authMock,
    from: fromMock,
    storage: storageMock,
};

export const createClient = jest.fn().mockReturnValue(mockClient);
export const __getMockClient = () => mockClient;
