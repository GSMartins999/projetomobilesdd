## 1. Setup e Inicialização do Projeto

- [ ] 1.1 Inicializar projeto Expo SDK 52 com template TypeScript: `create-expo-app --template blank-typescript` e configurar **Expo Dev Client** (necessário para react-native-maplibre com GL nativo) [infrastructure]
- [ ] 1.2 Instalar todas as dependências: expo-sqlite, drizzle-orm, react-native-maplibre, supabase-js, expo-secure-store, expo-camera, expo-file-system, expo-location, i18next, react-i18next, expo-localization, react-native-html-to-pdf, expo-notifications, zod [infrastructure]
- [ ] 1.3 Configurar estrutura de pastas Clean Architecture: `src/domain/`, `src/data/`, `src/presentation/`, `src/infrastructure/` [infrastructure]
- [ ] 1.4 Criar projeto Supabase: Auth + PostgreSQL + Storage Bucket `photos` [infrastructure]
- [ ] 1.5 Configurar variáveis de ambiente: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` [infrastructure]

## 2. Banco de Dados Local (SQLite + drizzle-orm)

- [ ] 2.1 Criar spike de validação: drizzle-orm + expo-sqlite funcionando com migration básica [data]
- [ ] 2.2 Definir schema drizzle: tabela `artworks` com todos os campos incluindo `uuid`, `display_id`, `deleted_at`, `device_id` [data]
- [ ] 2.3 Definir schema drizzle: tabela `inspections` com `technical_form` como TEXT (JSON) e campo `form_version INTEGER DEFAULT 1` [data]
- [ ] 2.4 Definir schema drizzle: tabela `photos` com `local_path`, `remote_url`, `upload_status`, `label`, `order` [data]
- [ ] 2.5 Definir schema drizzle: tabela `users` com `id`, `name`, `avatar_url`, `updated_at` [data]
- [ ] 2.6 Gerar e aplicar migration inicial via drizzle-kit [data]

## 3. Infraestrutura: DI, Navegação e i18n

- [ ] 3.1 Criar contextos de DI com factories: `ArtworkRepositoryContext`, `InspectionRepositoryContext`, `SyncServiceContext` [infrastructure]
- [ ] 3.2 Configurar React Navigation: Stack raiz com Splash, AuthStack e AppTabNavigator [infrastructure]
- [ ] 3.3 Configurar Bottom Tab Navigator com 4 abas: Mapa, Lista, Dashboard, Perfil [infrastructure]
- [ ] 3.4 Criar Modal Stack para flows de nova obra, inspeção, relatório e busca [infrastructure]
- [ ] 3.5 Configurar i18next com recursos pt-BR, en, es e detecção automática via expo-localization [infrastructure]
- [ ] 3.6 Criar arquivo de traduções `pt-BR.json` com todas as chaves do MVP [infrastructure]

## 4. Autenticação (capability: auth)

- [ ] 4.1 Criar `AuthRepository` (interface domain) e implementação com Supabase Auth [domain + data]
- [ ] 4.2 Criar usecase `LoginUseCase` e `LogoutUseCase` no domain [domain]
- [ ] 4.3 Implementar armazenamento de JWT em expo-secure-store (nunca AsyncStorage) [data]
- [ ] 4.4 Criar `LoginScreen` com formulário email/senha e feedback de erro [presentation]
- [ ] 4.5 Implementar lógica de autenticação offline: verificar JWT em expo-secure-store no startup; se expirado e sem internet, permitir acesso por **janela de graça de 7 dias** com banner de aviso persistente [data]
- [ ] 4.6 Criar `AuthContext` com estado `isAuthenticated` e hooks `useAuth` [infrastructure]

## 5. Onboarding (capability: onboarding)

- [ ] 5.1 Criar `OnboardingScreen` com 4 slides usando FlatList paginado [presentation]
- [ ] 5.2 Implementar solicitação de permissões de câmera e localização com justificativa LGPD [presentation]
- [ ] 5.3 Persistir flag `onboarding_completed` em expo-secure-store para não repetir [data]

## 6. Cadastro de Obras (capability: artwork-registration)

- [ ] 6.1 Criar entity `Artwork` e interface `ArtworkRepository` no domain [domain]
- [ ] 6.2 ~~Criar `InspectionFormSchema` (Zod)~~ → **movido para task 7.0** (pertence ao domínio de inspeções) [domain]
- [ ] 6.3 Criar usecase `CreateArtworkUseCase` com geração de UUID local [domain]
- [ ] 6.4 Implementar `ArtworkRepositoryImpl` com drizzle-orm (SQLite) [data]
- [ ] 6.5 Criar `CameraScreen` com expo-camera e compressão automática (max 1200px / 300KB) [presentation]
- [ ] 6.6 Criar `ArtworkFormScreen` com campos: nome, artista, tipo (enum), estado, notas [presentation]
- [ ] 6.7 Implementar geocoding reverso com expo-location para preencher `address` [data]
- [ ] 6.8 Implementar detecção de duplicatas: geofence 30m com alerta e ações [Vincular] e [Criar nova]. Comportamento de **[Vincular]**: descarta foto e GPS capturados, redireciona para `ArtworkDetailScreen` da obra existente. Comportamento de **[Criar nova]**: continua normalmente para `ArtworkFormScreen` [presentation + domain]

## 7. Formulário de Inspeção (capability: inspection-form)

- [ ] 7.0 Criar `InspectionFormSchemaV1` (Zod) para `technical_form` no domain, com mapa de schemas por `form_version` para suporte a versões futuras [domain]

- [ ] 7.1 Criar entity `Inspection` e interface `InspectionRepository` no domain [domain]
- [ ] 7.2 Criar entity `Photo` e interface `PhotoRepository` no domain [domain]
- [ ] 7.3 Criar `CreateInspectionUseCase` com validação Zod do `technical_form` (usando schema da `form_version`); após salvar inspeção com sucesso, **atualizar `conservation_status` da obra-mãe** com o `status_at_visit` da nova inspeção (e `updated_at` da obra) [domain]
- [ ] 7.4 Implementar `InspectionRepositoryImpl` e `PhotoRepositoryImpl` com drizzle-orm [data]
- [ ] 7.5 Criar `InspectionFormScreen` com campos de estado estrutural, superficial, agentes de deterioração, urgência [1-5] e recomendação [presentation]
- [ ] 7.6 Implementar upload de fotos com etiquetas (front | detail | context) e reordenação [presentation]
- [ ] 7.7 Criar `InspectionHistoryScreen` com lista cronológica de inspeções por obra [presentation]
- [ ] 7.8 Criar `InspectionDetailScreen` com visualização completa da inspeção e fotos [presentation]

## 8. Sincronização Offline (capability: offline-sync)

- [ ] 8.1 Criar `SyncService` no domain com interface para sync bidirecional [domain]
- [ ] 8.2 Implementar detecção de status de rede com NetInfo [data]
- [ ] 8.3 Implementar `SyncServiceImpl`: buscar registros com `synced_at = null` ou `updated_at > synced_at` [data]
- [ ] 8.4 Implementar resolução de conflito last-write-wins por `updated_at` [data]
- [ ] 8.5 Implementar propagação de soft delete via `deleted_at` para o Supabase [data]
- [ ] 8.6 Implementar pipeline de upload de fotos: pending → uploading → done/failed [data]
- [ ] 8.7 Criar tabela Supabase (PostgreSQL) espelhando o schema SQLite com RLS policies [infrastructure]
- [ ] 8.8 Configurar Supabase Bucket `photos` com permissões por `user_id` [infrastructure]

## 9. Mapa (capability: map-view)

- [ ] 9.1 Configurar react-native-maplibre com tiles OpenStreetMap e validar compatibilidade Managed Workflow [infrastructure]
- [ ] 9.2 Criar `MapScreen` com marcadores de obras coloridos por `conservation_status` [presentation]
- [ ] 9.3 Implementar download automático de tiles (raio 10km, intervalo 30 min) em background [data]
- [ ] 9.4 Implementar pausa no download se bateria < 20% [data]
- [ ] 9.5 Adicionar configuração "somente WiFi" nas Preferências para controle de download [presentation]

## 10. Relatório PDF (capability: pdf-report)

- [ ] 10.1 Criar `GenerateReportUseCase` com dois formatos: técnico e simplificado [domain]
- [ ] 10.2 Criar template HTML para relatório técnico (estado estrutural, fotos, dados profissional) [data]
- [ ] 10.3 Criar template HTML para relatório simplificado (linguagem acessível) [data]
- [ ] 10.4 Criar `ReportGeneratorScreen` com seleção de formato e opções [presentation]
- [ ] 10.5 Criar `PDFPreviewScreen` com preview e botão de compartilhamento via share sheet nativa [presentation]

## 11. Notificações (capability: notifications)

- [ ] 11.1 Configurar expo-notifications com permissões solicitadas no onboarding [infrastructure]
- [ ] 11.2 Criar `NotificationService` no domain com agendamento por obra [domain]
- [ ] 11.3 Implementar verificação diária: obras com `conservation_status: poor/urgent` sem inspeção há X dias [data]
- [ ] 11.4 Implementar navegação direta ao detalhe da obra ao tocar na notificação [presentation]
- [ ] 11.5 Criar `NotificationsScreen` com lista de alertas pendentes [presentation]

## 12. Busca e Filtros (capability: search-filters)

- [ ] 12.1 Criar `SearchArtworksUseCase` com busca textual (nome, artista, endereço) e filtros combinados [domain]
- [ ] 12.2 Implementar query drizzle com full-text search simulado e filtros AND [data]
- [ ] 12.3 Criar `SearchScreen` com campo de busca e pills de filtro por tipo e estado [presentation]

## 13. Dashboard (capability: dashboard)

- [ ] 13.1 Criar `GetDashboardStatsUseCase` com contagem por `conservation_status` e obras sem visita recente [domain]
- [ ] 13.2 Criar `DashboardScreen` com cards por estado e navegação para lista filtrada [presentation]

## 14. Perfil e Preferências

- [ ] 14.1 Criar `ProfileScreen` com dados do usuário (nome, avatar_url) e botão de logout [presentation]
- [ ] 14.2 Criar `PreferencesScreen` com seleção de idioma, threshold de revisita e configuração de tiles [presentation]
- [ ] 14.3 Implementar troca de idioma em runtime via i18next sem reiniciar o app [presentation]

## 15. Testes e Qualidade

- [ ] 15.1 Configurar Jest para testes de domain (usecases, entities, schemas Zod) [domain]
- [ ] 15.2 Escrever testes unitários para `CreateArtworkUseCase` e lógica de sync [domain]
- [ ] 15.3 Escrever testes unitários para `InspectionFormSchema` (Zod) [domain]
- [ ] 15.4 Configurar Maestro para testes E2E básicos (login → cadastrar obra → inspecionar) [infrastructure]
- [ ] 15.5 Instalar e configurar `@testing-library/react-native` + `@testing-library/jest-native` com preset `jest-expo`; configurar mocks de `expo-camera`, `expo-location`, `expo-secure-store` e `expo-sqlite` [infrastructure]
- [ ] 15.6 Escrever testes RNTL para `LoginScreen` (submit com credenciais válidas e inválidas, exibição de erro inline) [presentation]
- [ ] 15.7 Escrever testes RNTL para `ArtworkFormScreen` (validação de campos obrigatórios, submit com dados completos) [presentation]
- [ ] 15.8 Escrever testes RNTL para `InspectionFormScreen` (limite de 10 fotos bloqueado, campos obrigatórios, urgência [1–5]) [presentation]
- [ ] 15.9 Escrever testes RNTL para `DashboardScreen` (renderização de cards por estado de conservação, navegação para lista filtrada) [presentation]
