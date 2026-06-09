## Context

O Curata é um app offline-first construído sobre Clean Architecture. Toda a camada de dados já existe e está implementada:

- `AuthRepositoryImpl` usa `@supabase/supabase-js` (signIn, signUp, signOut, getUser, refreshSession).
- `SyncServiceImpl` faz upload via `supabase.from(table).upsert()` e download via `.select('*').gt('updated_at', ...)`.
- `SyncServiceImpl.uploadPendingPhotos` usa `supabase.storage.from('curata-media').upload()`.
- `supabaseClient.ts` já cria o cliente com `createClient`, usando `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

O que **não existe** é:
1. Um projeto Supabase real configurado (tabelas, RLS, bucket).
2. As variáveis de ambiente reais preenchidas.
3. O App.tsx usando a implementação real de auth ao invés do mock.
4. Um adapter de `AsyncStorage` para o cliente Supabase funcionar corretamente no React Native/Expo.

## Goals / Non-Goals

**Goals:**
- Provisionar o schema PostgreSQL no Supabase (tabelas + RLS + policies).
- Provisionar o bucket `curata-media` com políticas de segurança.
- Configurar o Supabase client com `AsyncStorage` adapter para Expo (`@react-native-async-storage/async-storage`).
- Substituir `MockAuthRepositoryImpl` pelo `AuthRepositoryImpl` real no `App.tsx`.
- Remover o fallback de mock hardcoded do `useAuth()`.
- Refatorar a guard de sync no `SyncContext` para checar autenticação em vez de URL placeholder.
- Documentar o processo de setup em `SUPABASE_SETUP.md`.

**Non-Goals:**
- Alterar o schema local SQLite/Drizzle.
- Implementar OAuth, login social ou MFA.
- Configurar ambientes staging/prod separados.

## Decisions

### D1 — AsyncStorage Adapter no Cliente Supabase

O `@supabase/supabase-js` em ambiente React Native requer um adapter de storage para persistir a sessão entre reinicializações do app. Por padrão, tenta usar `localStorage` (browser), o que falha silenciosamente no RN.

**Decisão**: Instalar `@react-native-async-storage/async-storage` e configurá-lo como `storage` no `createClient`. Não usar `expo-secure-store` diretamente no client Supabase (o `expo-secure-store` já é usado pela camada de auth para o JWT de forma explícita). O Supabase usará `AsyncStorage` para gerenciar sua session interna.

```typescript
// src/data/supabaseClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
```

---

### D2 — Substituição do MockAuth no App.tsx

O `App.tsx` atualmente injeta `MockAuthRepositoryImpl` na linha:
```typescript
const authRepository = useRef(new MockAuthRepositoryImpl()).current;
```

**Decisão**: Substituir por `AuthRepositoryImpl`, passando o cliente `supabase` como dependência:
```typescript
import { AuthRepositoryImpl } from './data/repositories/AuthRepositoryImpl';
// ...
const authRepository = useRef(new AuthRepositoryImpl(supabase)).current;
```

---

### D3 — Remoção do Fallback Mock no AuthContext

O `useAuth()` atual retorna um usuário fictício hardcoded quando chamado fora do `AuthProvider`:
```typescript
// PROBLEMA: isso mascara erros de uso incorreto e "autentica" qualquer tela
if (!context) {
    return { user: { id: 'device-id-123', ... }, isAuthenticated: true, ... };
}
```

**Decisão**: Remover o fallback e lançar um erro explícito, forçando o uso correto do hook dentro do `AuthProvider`. Isso é seguro porque o `App.tsx` já envolve toda a árvore com `<AuthProvider>`.

```typescript
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
```

---

### D4 — Refatoração da Guard de Sync

O `SyncContext.tsx` detecta Supabase não configurado comparando a URL por substring:
```typescript
if (supabaseUrl.includes('placeholder')) { /* aborta */ }
```

**Decisão**: Substituir essa heurística frágil por uma verificação de autenticação real. O sync só faz sentido quando o usuário está autenticado:

```typescript
// Verificar sessão ativa antes de sincronizar
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
    console.log('[SyncContext] Usuário não autenticado — sync ignorado.');
    setIsSyncing(false);
    return;
}
```

---

### D5 — Schema SQL e RLS no Supabase

Cada tabela no PostgreSQL espelha o schema SQLite local, com RLS habilitado e policies que restringem acesso ao `auth.uid()`.

**Tabelas a criar**: `users`, `artworks`, `inspections`, `photos`.

**RLS Policy padrão**: Cada tabela terá policies de `SELECT`, `INSERT`, `UPDATE` onde `device_id` é atrelado ao usuário ou `auth.uid()` é verificado diretamente.

> Nota: Como o modelo v1 é single-user (um curador por dispositivo), a policy mais simples é: "usuário autenticado pode ler e escrever todos os seus próprios registros". Para o MVP, uma policy permissiva de `auth.role() = 'authenticated'` já é suficiente, com refinamento futuro.

**Bucket `curata-media`**:
- Visibilidade: `private` (upload/download requer token JWT válido).
- Policy de upload: `auth.role() = 'authenticated'`.
- Estrutura de path: `photos/{artwork_id}/{photo_id}.jpg`.

---

### D6 — Arquivo SUPABASE_SETUP.md

Documentar passo a passo o processo de:
1. Criar projeto no Supabase Dashboard.
2. Copiar URL e anon key para `.env`.
3. Executar o SQL de criação das tabelas e RLS.
4. Criar o bucket `curata-media`.
5. Verificar que o app conecta (smoke test manual).

---

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `@react-native-async-storage/async-storage` conflitar com versão já instalada via Expo | Verificar `package.json` — a lib já pode estar como dependência transitiva de outras libs Expo; usar `expo install` para resolver versão compatível |
| RLS muito permissiva no MVP expõe dados entre usuários em testes compartilhados | Aceitável para v1 single-user; documentar como escopo de melhoria em v2 |
| Remoção do fallback mock no `useAuth()` pode quebrar telas que o usavam fora do provider | O `AuthProvider` já envolve toda a árvore no `App.tsx` — sem risco |
| Usuários de teste com sessões em `placeholder` ficarem presos na tela de loading | Limpar AsyncStorage / SecureStore ao fazer o switch para produção |
