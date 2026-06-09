## 1. Supabase — Provisionamento Externo

- [ ] 1.1 Criar projeto no Supabase Dashboard e copiar `Project URL` e `anon key` [infrastructure]
  - Critério: projeto criado, chaves disponíveis no dashboard

- [ ] 1.2 Executar o SQL de criação das tabelas `users`, `artworks`, `inspections`, `photos` no Supabase SQL Editor [infrastructure]
  - Critério: tabelas visíveis no Table Editor do Supabase sem erros

  ```sql
  -- users
  CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ
  );

  -- artworks
  CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id TEXT,
    name TEXT NOT NULL,
    artist TEXT,
    type TEXT NOT NULL,
    conservation_status TEXT NOT NULL,
    notes TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    device_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
  );

  -- inspections
  CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES public.artworks(id),
    technical_form JSONB NOT NULL,
    form_version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
  );

  -- photos
  CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.inspections(id),
    artwork_id UUID NOT NULL REFERENCES public.artworks(id),
    local_path TEXT NOT NULL,
    remote_url TEXT,
    upload_status TEXT NOT NULL DEFAULT 'pending',
    label TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
  );
  ```

- [ ] 1.3 Habilitar RLS nas tabelas e criar policies de acesso autenticado [infrastructure]
  - Critério: RLS habilitado; um usuário autenticado consegue INSERT e SELECT, um usuário anônimo recebe erro 401

  ```sql
  ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

  -- Policy: usuário autenticado tem acesso total (MVP single-user)
  CREATE POLICY "Authenticated full access" ON public.artworks
    FOR ALL USING (auth.role() = 'authenticated');

  CREATE POLICY "Authenticated full access" ON public.inspections
    FOR ALL USING (auth.role() = 'authenticated');

  CREATE POLICY "Authenticated full access" ON public.photos
    FOR ALL USING (auth.role() = 'authenticated');
  ```

- [ ] 1.4 Criar o bucket `curata-media` no Supabase Storage (privado) e configurar a policy de upload [infrastructure]
  - Critério: bucket existe, usuário autenticado consegue fazer upload de arquivo via dashboard

  ```sql
  -- Via SQL (ou pelo Dashboard: Storage > New bucket > "curata-media", private)
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('curata-media', 'curata-media', false);

  CREATE POLICY "Authenticated upload"
    ON storage.objects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  CREATE POLICY "Authenticated read"
    ON storage.objects FOR SELECT
    USING (auth.role() = 'authenticated');
  ```

---

## 2. Configuração do Ambiente Local [infrastructure]

- [ ] 2.1 Criar o arquivo `.env` na raiz de `curata-app/` com as variáveis reais [infrastructure]
  - Critério: arquivo `.env` existe com valores reais, `.gitignore` já inclui `.env` (verificar)

  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY
  ```

- [ ] 2.2 Verificar que `.env` está no `.gitignore` de `curata-app/` [infrastructure]
  - Critério: `git status` não lista `.env` como arquivo rastreado

---

## 3. Camada de Dados — AsyncStorage Adapter [data]

- [ ] [TEST] 3.1 Escrever teste unitário que verifica que o `supabaseClient` é criado com a opção `storage` configurada [data]
  - Critério: teste passa com mock de `AsyncStorage`

- [ ] 3.2 Instalar `@react-native-async-storage/async-storage` compatível com Expo SDK 54 [data]
  - Critério: `expo install @react-native-async-storage/async-storage` sem warnings de peer dependency

- [ ] 3.3 Atualizar `src/data/supabaseClient.ts` para importar e configurar `AsyncStorage` como adapter de storage do cliente Supabase [data]
  - Critério: app inicializa sem warnings de `localStorage is not defined` no Metro bundler

---

## 4. Camada de Infraestrutura — App.tsx e AuthContext [infrastructure]

- [ ] [TEST] 4.1 Escrever teste de integração para `AuthRepositoryImpl` que verifica que `signIn` com credenciais inválidas lança erro correto [data]
  - Critério: teste passa com mock do `SupabaseClient`

- [ ] 4.2 Substituir `MockAuthRepositoryImpl` por `AuthRepositoryImpl` no `App.tsx` [infrastructure]
  - Critério: `App.tsx` importa e instancia `AuthRepositoryImpl(supabase)` na linha de `authRepository`

- [ ] 4.3 Remover o fallback de mock hardcoded do `useAuth()` em `AuthContext.tsx` e lançar erro explícito quando usado fora do `AuthProvider` [infrastructure]
  - Critério: `useAuth()` lança `Error('useAuth deve ser usado dentro de um AuthProvider')` quando context é null

---

## 5. Camada de Infraestrutura — Guard de Sync [infrastructure]

- [ ] [TEST] 5.1 Escrever teste para `SyncContext` que verifica que `triggerSync` não chama `syncService.sync()` quando não há sessão ativa [infrastructure]
  - Critério: teste passa com mock do `supabase.auth.getSession()` retornando `{ data: { session: null } }`

- [ ] 5.2 Refatorar `SyncContext.tsx` para remover a comparação de URL por string (`includes('placeholder')`) e substituir por verificação de sessão Supabase via `supabase.auth.getSession()` [infrastructure]
  - Critério: sync é ignorado com log claro quando `session === null`; sync executa normalmente quando sessão está ativa

---

## 6. Documentação [infrastructure]

- [ ] 6.1 Criar o arquivo `curata-app/SUPABASE_SETUP.md` com passo a passo do provisionamento e configuração local [infrastructure]
  - Critério: documento cobre criação de projeto, execução do SQL, criação do bucket, preenchimento do `.env` e smoke test manual
