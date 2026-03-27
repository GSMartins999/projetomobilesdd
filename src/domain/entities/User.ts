export interface User {
    id: string;          // igual ao id do Supabase Auth
    name: string;
    email: string;
    avatarUrl: string | null;
    updatedAt: string;
    syncedAt: string | null;
}
