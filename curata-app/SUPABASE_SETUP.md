# Configuração do Supabase para o Curata

Este documento orienta sobre como configurar o seu projeto no Supabase Dashboard, criar as tabelas do banco de dados, RLS (Row Level Security) e o bucket de mídia.

---

## 1. Acessando o SQL Editor no Supabase

1. Acesse o **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Selecione o seu projeto (**Curata** ou correspondente).
3. No menu lateral esquerdo, clique no ícone **"SQL Editor"** (o ícone se parece com `</>`).
4. Clique no botão **"New query"** (Nova consulta) no painel esquerdo para abrir uma aba vazia.
5. Cole o código SQL da seção abaixo e clique no botão **"Run"** (no canto inferior direito do painel de edição).

---

## 2. Código SQL das Tabelas, RLS e Triggers

Copie e cole o código abaixo no SQL Editor e execute-o:

```sql
-- 1. Tabela de Usuários (espelho de auth.users para metadados adicionais)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Referência direta ao ID de auth.users
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);

-- 2. Tabela de Obras de Arte (Artworks)
CREATE TABLE IF NOT EXISTS public.artworks (
  id TEXT PRIMARY KEY,
  display_id TEXT,
  name TEXT NOT NULL,
  artist TEXT,
  type TEXT NOT NULL,
  conservation_status TEXT NOT NULL,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  device_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

-- 3. Tabela de Inspeções (Inspections)
CREATE TABLE IF NOT EXISTS public.inspections (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  technical_form JSONB NOT NULL,
  form_version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

-- 4. Tabela de Fotos (Photos)
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  inspection_id TEXT REFERENCES public.inspections(id) ON DELETE SET NULL,
  artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  local_path TEXT NOT NULL,
  remote_url TEXT,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  label TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

-- Habilitar Row Level Security (RLS) para proteção dos dados
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (MVP: usuários autenticados têm acesso total às tabelas)
CREATE POLICY "Acesso total de usuários autenticados" ON public.users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total de usuários autenticados" ON public.artworks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total de usuários autenticados" ON public.inspections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total de usuários autenticados" ON public.photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger automático para criar o registro em public.users sempre que um usuário se registrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, updated_at, synced_at)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Gestor'),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    now()::text,
    now()::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Criando o Bucket de Mídia no Supabase Storage

O app Curata realiza o upload das fotos das vistorias para um bucket privado no Supabase Storage. Siga estes passos para criá-lo e configurá-lo:

1. No menu lateral esquerdo do Supabase Dashboard, clique em **"Storage"** (ícone de caixa/balde).
2. Clique no botão **"New bucket"** (Novo balde).
3. Preencha os detalhes do bucket:
   - **Name**: `curata-media`
   - **Public bucket**: Deixe desativado (desmarcado) por segurança.
4. Clique em **Save**.
5. Clique em **"curata-media"** na lista de buckets e depois em **"Policies"** (no menu superior ou lateral de configurações do Storage).
6. Adicione políticas de segurança para o bucket `curata-media`:
   - Selecione a opção para criar uma política personalizada.
   - Nomeie como: `Permitir upload e leitura para usuários autenticados`.
   - Em **Allowed Operations**, selecione **INSERT** e **SELECT**.
   - Em **Target roles**, selecione **authenticated**.
   - Salve a política.

---

## Próximo Passo

Assim que concluir a criação das tabelas e do bucket no console do Supabase, me avise para que possamos atualizar os arquivos do aplicativo (conectando o app ao banco real e desativando os mocks)!
