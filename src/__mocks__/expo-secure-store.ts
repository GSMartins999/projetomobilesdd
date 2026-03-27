// Mock expo-secure-store — in-memory key/value store
const store = new Map<string, string>();

export const setItemAsync = jest.fn(async (key: string, value: string) => {
    store.set(key, value);
});

export const getItemAsync = jest.fn(async (key: string) => {
    return store.get(key) ?? null;
});

export const deleteItemAsync = jest.fn(async (key: string) => {
    store.delete(key);
});

export const isAvailableAsync = jest.fn(async () => true);

// Helper para testes: limpar o store antes de cada teste
export const __clearStore = () => store.clear();
