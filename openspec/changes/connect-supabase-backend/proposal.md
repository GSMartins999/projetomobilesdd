## Why

O aplicativo **Curata** foi construído com a infraestrutura correta para integrar o Supabase (cliente já configurado, repositório de auth real implementado, serviço de sync completo), porém **ainda não está conectado de fato**. Em produção:

1. O `App.tsx` injeta `MockAuthRepositoryImpl` em vez de `AuthRepositoryImpl`, ou seja, qualquer e-mail/senha é aceito sem validação real.
2. A variável de ambiente `EXPO_PUBLIC_SUPABASE_URL` usa `placeholder` — o sync detecta isso e aborta silenciosamente em `SyncContext.tsx`.
3. Não existe projeto Supabase provisionado: sem tabelas PostgreSQL, sem Storage Bucket `curata-media`, sem Row Level Security, sem políticas de acesso.
4. A `AuthContext` está com fallback de mock hardcoded (`isAuthenticated: true`) quando o `AuthProvider` não encontra contexto, permitindo que a app "funcione" sem autenticação real.

O resultado é um app funcional em modo de desenvolvimento local, mas sem nenhuma persistência ou autenticação real. Esta mudança resolve isso end-to-end.

## What Changes

Conectar o Curata ao Supabase real end-to-end, cobrindo:

- **Provisionamento do Supabase**: Criar e documentar o schema SQL das tabelas `artworks`, `inspections`, `photos`, `users` com RLS e políticas de acesso por usuário autenticado.
- **Storage**: Provisionar o bucket `curata-media` com política de upload/leitura restrita ao usuário autenticado.
- **Configuração local**: Criar `.env` com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` reais (documentado, não commitado).
- **Substituição do MockAuth**: Trocar `MockAuthRepositoryImpl` por `AuthRepositoryImpl` real no `App.tsx`.
- **Correção do AuthContext**: Remover o fallback de mock hardcoded do `useAuth()`, lançar erro correto se usado fora do `AuthProvider`.
- **Supabase Storage adapter**: Verificar e garantir que o `AsyncStorage` não é usado — o cliente Supabase precisa de um adapter de storage compatível com Expo (`expo-secure-store` ou `AsyncStorage` via `@react-native-async-storage/async-storage`).
- **Validação de conectividade**: O `SyncContext` deve deixar de comparar URL por string `placeholder` e passar a verificar se o usuário está autenticado antes de sincronizar.
- **Smoke test de integração**: Script de teste manual documentado para validar login → cadastrar obra → sync → visualizar no dashboard Supabase.

## Capabilities

### New Capabilities

- `real-auth`: Login e registro de usuários reais via Supabase Auth (email + password).
- `cloud-sync`: Sincronização real de artworks, inspections e photos com o PostgreSQL do Supabase.
- `photo-upload`: Upload real de fotos para o Storage Bucket `curata-media` com URL pública persistida.

### Modified Capabilities

- `offline-auth`: O token JWT agora é real (Supabase session), persistido via `expo-secure-store`.
- `sync-guard`: A guard de sync passa a verificar autenticação real ao invés de placeholder de URL.

## Non-goals

- Implementação de Row Level Security multitenant (equipes/organizações) — escopo v2.
- OAuth / login social (Google, Apple) — escopo v2.
- Migração de dados de dispositivos de teste para produção.
- Deploy CI/CD ou configuração de ambientes staging/prod separados.
- Integração com Supabase Realtime (subscriptions) — offline-first LWW é suficiente para v1.

## Impact

- **`src/App.tsx`**: Substituição do `MockAuthRepositoryImpl` pelo `AuthRepositoryImpl` real.
- **`src/infrastructure/auth/AuthContext.tsx`**: Remoção do fallback de mock no `useAuth()`.
- **`src/infrastructure/sync/SyncContext.tsx`**: Refatoração da guard de sync (autenticação vs. URL placeholder).
- **`src/data/supabaseClient.ts`**: Verificar necessidade de `AsyncStorage` adapter para Expo.
- **Supabase (externo)**: Criação de tabelas, RLS, policies, bucket — documentado em SQL migration.
- **`.env`**: Variável de ambiente real (instruções no README, não commitada).
