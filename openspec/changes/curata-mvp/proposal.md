## Why

Profissionais de conservação e restauração de arte trabalham em campo — em espaços públicos, igrejas, monumentos e museus — sem ferramentas digitais específicas para o seu nicho. Hoje dependem de papel, WhatsApp e planilhas para registrar o estado de obras. O Curata resolve isso com um app mobile offline-first que transforma o trabalho de campo em dados estruturados, rastreáveis e sincronizáveis.

## What Changes

Criação do aplicativo Curata do zero — novo projeto Expo + React Native com Clean Architecture:

- **Novo**: App mobile iOS + Android com suporte offline-first via SQLite
- **Novo**: Autenticação via Supabase Auth com JWT armazenado em expo-secure-store
- **Novo**: Cadastro de obras com câmera, GPS e formulário técnico estruturado
- **Novo**: Sistema de inspeções com formulário técnico validado por Zod + fotos etiquetadas
- **Novo**: Sincronização offline → Supabase com last-write-wins por `updated_at` + soft delete via `deleted_at`
- **Novo**: Mapa de obras com react-native-maplibre + tiles OpenStreetMap offline
- **Novo**: Geração de relatório PDF em dois formatos (técnico e simplificado)
- **Novo**: Notificações de revisita para obras em estado precário ou urgente
- **Novo**: Busca e filtros sobre o acervo de obras
- **Novo**: Dashboard com resumo por estado de conservação
- **Novo**: Internacionalização em pt-BR, en e es
- **Novo**: Onboarding na primeira execução com solicitação de permissões LGPD-compliant

## Capabilities

### New Capabilities

- `auth`: Autenticação com Supabase Auth, JWT offline em expo-secure-store, refresh automático quando online
- `artwork-registration`: Cadastro de obras com câmera, GPS, endereço por geocoding reverso, ID único (UUID + display_id ART-YYYY-XXXXX)
- `inspection-form`: Formulário técnico de inspeção com estado estrutural, agentes de deterioração, urgência [1–5] e fotos etiquetadas
- `offline-sync`: Sincronização SQLite ↔ Supabase com last-write-wins, soft delete, upload de fotos por estado (pending → done)
- `map-view`: Mapa de obras com react-native-maplibre, tiles offline por raio de 10km, marcadores por estado de conservação
- `duplicate-detection`: Geofence de 30m ao cadastrar obra + revisão visual de obras próximas
- `pdf-report`: Geração de PDF em dois formatos — técnico (para profissionais) e simplificado (para leigos)
- `notifications`: Lembretes de revisita para obras sem visita há X dias (configurável) via expo-notifications
- `search-filters`: Busca textual e filtros por tipo, estado e data de última inspeção
- `dashboard`: Visão geral do acervo por estado de conservação e alertas de revisita
- `i18n`: Internacionalização em pt-BR, en, es com detecção automática e fallback para inglês
- `onboarding`: Fluxo de primeira execução com tutorial e solicitação de permissões

### Modified Capabilities

*(Nenhuma — projeto novo)*

## Impact

- **Novo projeto**: inicialização com `create-expo-app` (TypeScript, Managed Workflow)
- **Dependências principais**: expo-sqlite, drizzle-orm, react-native-maplibre, supabase-js, expo-secure-store, expo-camera, expo-file-system, expo-location, i18next, react-native-html-to-pdf, expo-notifications, zod
- **Backend**: projeto Supabase a criar (Auth + PostgreSQL + Storage Buckets)
- **Non-goals v1**: colaboração em equipe, integração IPHAN, QR Code nas obras, mapa de calor, modo público
