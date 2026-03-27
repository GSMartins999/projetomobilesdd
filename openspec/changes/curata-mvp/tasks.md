## 1. Setup e Inicialização do Projeto

- [x] 1.1 Inicializar projeto Expo SDK 52 com template TypeScript: `create-expo-app --template blank-typescript` e configurar **Expo Dev Client** (necessário para react-native-maplibre com GL nativo) [infrastructure]
- [x] 1.2 Instalar todas as dependências: expo-sqlite, drizzle-orm, react-native-maplibre, supabase-js, expo-secure-store, expo-camera, expo-file-system, expo-location, i18next, react-i18next, expo-localization, react-native-html-to-pdf, expo-notifications, zod [infrastructure]
- [x] 1.3 Configurar estrutura de pastas Clean Architecture: `src/domain/`, `src/data/`, `src/presentation/`, `src/infrastructure/` [infrastructure]
- [ ] 1.4 Criar projeto Supabase: Auth + PostgreSQL + Storage Bucket `photos` [infrastructure]
- [x] 1.5 Configurar variáveis de ambiente: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` [infrastructure]
- [x] 1.6 [TEST] Configurar infra de testes TDD: Jest + preset `jest-expo`, RNTL (`@testing-library/react-native`), mocks estáticos de `expo-camera`, `expo-location`, `expo-sqlite`, `expo-secure-store`, `@supabase/supabase-js`; scripts `test` e `test:watch`; coverage threshold (domain 80%, data/presentation 70%) [infrastructure]

## 2. Banco de Dados Local (SQLite + drizzle-orm)

- [x] 2.1 Criar spike de validação: drizzle-orm + expo-sqlite funcionando com migration básica [data]
- [x] 2.2 Definir schema drizzle: tabela `artworks` com todos os campos incluindo `uuid`, `display_id`, `deleted_at`, `device_id` [data]
- [x] 2.3 Definir schema drizzle: tabela `inspections` com `technical_form` como TEXT (JSON) e campo `form_version INTEGER DEFAULT 1` [data]
- [x] 2.4 Definir schema drizzle: tabela `photos` com `local_path`, `remote_url`, `upload_status`, `label`, `order` [data]
- [x] 2.5 Definir schema drizzle: tabela `users` com `id`, `name`, `avatar_url`, `updated_at` [data]
- [x] 2.6 Gerar e aplicar migration inicial via drizzle-kit [data]

## 3. Infraestrutura: DI, Navegação e i18n

- [x] 3.1 Criar contextos de DI com factories: `ArtworkRepositoryContext`, `InspectionRepositoryContext`, `SyncServiceContext` [infrastructure]
- [x] 3.2 Configurar React Navigation: Stack raiz com Splash, AuthStack e AppTabNavigator [infrastructure]
- [x] 3.3 Configurar Bottom Tab Navigator com 4 abas: Mapa, Lista, Dashboard, Perfil [infrastructure]
- [x] 3.4 Criar Modal Stack para flows de nova obra, inspeção, relatório e busca [infrastructure]
- [x] 3.5 Configurar i18next com recursos pt-BR, en, es e detecção automática via expo-localization [infrastructure]
- [x] 3.6 Criar arquivo de traduções `pt-BR.json` com todas as chaves do MVP [infrastructure]

## 4. Autenticação (capability: auth)

- [x] 4.1 Criar `AuthRepository` (interface domain) e implementação com Supabase Auth [domain + data]
- [x] 4.2 [TEST] Escrever testes unitários para `LoginUseCase` e `LogoutUseCase`: credenciais válidas, inválidas, erro de rede, logout limpa store [domain]
- [x] 4.3 Criar usecase `LoginUseCase` e `LogoutUseCase` no domain [domain]
- [x] 4.4 Implementar armazenamento de JWT em expo-secure-store (nunca AsyncStorage) [data]
- [x] 4.5 [TEST] Escrever testes RNTL para `LoginScreen`: submit com credenciais válidas, credenciais inválidas, exibição de erro inline, estado de loading [presentation]
- [x] 4.6 Criar `LoginScreen` com formulário email/senha e feedback de erro [presentation]
- [x] 4.7 Implementar lógica de autenticação offline: verificar JWT em expo-secure-store no startup; se expirado e sem internet, permitir acesso por **janela de graça de 7 dias** com banner de aviso persistente [data]
- [x] 4.8 Criar `AuthContext` com estado `isAuthenticated` e hooks `useAuth` [infrastructure]

## 5. Onboarding (capability: onboarding)

- [x] 5.1 [TEST] Escrever testes RNTL para `OnboardingScreen`: 4 slides renderizados, permissão câmera concedida/negada avança slide, permissão localização concedida/negada avança slide, flag `onboarding_completed` gravada [presentation]
- [x] 5.2 Criar `OnboardingScreen` com 4 slides usando FlatList paginado [presentation]
- [x] 5.3 Implementar solicitação de permissões de câmera e localização com justificativa LGPD [presentation]
- [x] 5.4 Persistir flag `onboarding_completed` em expo-secure-store para não repetir [data]

## 6. Cadastro de Obras (capability: artwork-registration)

- [x] 6.1 Criar entity `Artwork` e interface `ArtworkRepository` no domain [domain]
- [x] 6.2 [TEST] Escrever testes unitários para `CreateArtworkUseCase`: UUID gerado, campos obrigatórios validados, `synced_at = null` ao criar offline, detecção de duplicata em raio 30m [domain]
- [x] 6.3 Criar usecase `CreateArtworkUseCase` com geração de UUID local [domain]
- [x] 6.4 [TEST] Escrever testes unitários para `DuplicateDetectionUseCase`: obra a < 30m retorna alerta; obra a ≥ 30m não retorna alerta [domain]
- [x] 6.5 Implementar `ArtworkRepositoryImpl` com drizzle-orm (SQLite) [data]
- [x] 6.6 [TEST] Escrever testes RNTL para `ArtworkFormScreen`: campos obrigatórios bloqueiam submit, submit completo chama usecase, sem permissão de câmera exibe banner e desabilita campo de foto [presentation]
- [x] 6.7 Criar `CameraScreen` com expo-camera e compressão automática (max 1200px / 300KB) [presentation]
- [x] 6.8 Criar `ArtworkFormScreen` com campos: nome, artista, tipo (enum), estado, notas [presentation]
- [x] 6.9 Implementar geocoding reverso com expo-location para preencher `address` [data]
- [x] 6.10 Implementar detecção de duplicatas: geofence 30m com alerta e ações [Vincular] e [Criar nova]. Comportamento de **[Vincular]**: descarta foto e GPS capturados, redireciona para `ArtworkDetailScreen` da obra existente. Comportamento de **[Criar nova]**: continua normalmente para `ArtworkFormScreen` [presentation + domain]

## 7. Formulário de Inspeção (capability: inspection-form)

- [x] 7.0 [TEST] Escrever testes unitários para `InspectionFormSchemaV1` (Zod): campos obrigatórios, urgência 1-5, estrutural/superficial válido, dados inválidos rejeitados [domain]
- [x] 7.1 Criar `InspectionFormSchemaV1` (Zod) para `technical_form` no domain, com mapa de schemas por `form_version` para suporte a versões futuras [domain]
- [x] 7.2 Criar entity `Inspection` e interface `InspectionRepository` no domain [domain]
- [x] 7.3 Criar entity `Photo` e interface `PhotoRepository` no domain [domain]
- [x] 7.4 [TEST] Escrever testes unitários para `CreateInspectionUseCase`: validação Zod do `technical_form`, atualização de `conservation_status` da obra-mãe após salvar, falha com dados inválidos [domain]
- [x] 7.5 Criar `CreateInspectionUseCase` com validação Zod do `technical_form` (usando schema da `form_version`); após salvar inspeção com sucesso, **atualizar `conservation_status` da obra-mãe** com o `status_at_visit` da nova inspeção (e `updated_at` da obra) [domain]
- [x] 7.6 Implementar `InspectionRepositoryImpl` e `PhotoRepositoryImpl` com drizzle-orm [data]
- [x] 7.7 [TEST] Escrever testes RNTL para `InspectionFormScreen`: limite de 10 fotos bloqueado, campos obrigatórios bloqueiam submit, urgência aceita apenas 1-5 [presentation]
- [x] 7.8 Criar `InspectionFormScreen` com campos de estado estrutural, superficial, agentes de deterioração, urgência [1-5] e recomendação [presentation]
- [x] 7.9 Implementar upload de fotos com etiquetas (front | detail | context) e reordenação [presentation]
- [x] 7.10 Criar `InspectionHistoryScreen` com lista cronológica de inspeções por obra [presentation]
- [x] 7.11 Criar `InspectionDetailScreen` com visualização completa da inspeção e fotos [presentation]

## 8. Sincronização Offline (capability: offline-sync)

- [x] 8.1 Criar interface `SyncService` no domain [domain]
- [x] 8.2 [TEST] Escrever testes unitários para `SyncServiceImpl`: upload de registros locais novos, download de registros remotos mais novos (LWW), tratamento de erro de rede [data]
- [x] 8.3 Implementar `SyncServiceImpl` com lógica **Last-Write-Wins** baseada no campo `updated_at` [data]
- [x] 8.4 Implementar upload de fotos (binários) para Supabase Storage; comprimir imagens antes do upload [data]
- [x] 8.5 Garantir que o upload de fotos atualize o `remote_url` no SQLite local [data]
- [x] 8.6 Implementar propagação de soft delete via `deleted_at` para o Supabase [data]
- [x] 8.7 Implementar pipeline de upload de fotos: pending → uploading → done/failed [data]
- [x] 8.8 Criar tabela Supabase (PostgreSQL) espelhando o schema SQLite com RLS policies [infrastructure]
- [x] 8.9 [TEST] Testar sincronização: criar obra offline → ativar rede → verificar no dashboard Supabase [verification]

## 9. Mapa (capability: map-view)

- [x] 9.1 Instalar e configurar `@maplibre/maplibre-react-native` [infrastructure]
- [x] 9.2 Criar `MapScreen` com exibição de pins das obras locais [presentation]
- [x] 9.3 Implementar coloração de pins por `conservation_status` [presentation]
- [x] 9.4 Implementar clustering de pins para performance (>100 obras) [presentation]
- [x] 9.5 Configurar download de tiles offline para áreas de rede precária [data]
- [x] 9.6 [TEST] Verificar mapa sem internet: tiles em cache/offline devem carregar [verification]

## 10. Relatório PDF (capability: pdf-report)

- [ ] 10.1 [TEST] Escrever testes unitários para `GenerateReportUseCase`: formato técnico gera HTML com dados estruturais, formato simplificado usa linguagem acessível, obra sem inspeção retorna erro [domain]
- [ ] 10.2 Criar `GenerateReportUseCase` com dois formatos: técnico e simplificado [domain]
- [ ] 10.3 Criar template HTML para relatório técnico (estado estrutural, fotos, dados profissional) [data]
- [ ] 10.4 Criar template HTML para relatório simplificado (linguagem acessível) [data]
- [ ] 10.5 Criar `ReportGeneratorScreen` com seleção de formato e opções [presentation]
- [ ] 10.6 Criar `PDFPreviewScreen` com preview e botão de compartilhamento via share sheet nativa [presentation]

## 11. Notificações (capability: notifications)

- [x] 11.1 Configurar expo-notifications com permissões solicitadas no onboarding [infrastructure]
- [x] 11.2 Criar `NotificationService` no domain com agendamento por obra [domain]
- [x] 11.3 Implementar verificação diária: obras com `conservation_status: poor/urgent` sem inspeção há X dias [data]
- [x] 11.4 Implementar navegação direta ao detalhe da obra ao tocar na notificação [presentation]
- [x] 11.5 Criar `NotificationsScreen` com lista de alertas pendentes [presentation]

## 12. Busca e Filtros (capability: search-filters)

- [x] 12.1 [TEST] Escrever testes unitários para `SearchArtworksUseCase`: busca por nome retorna obras corretas, filtro por tipo combinado com estado retorna interseção, busca sem resultados retorna lista vazia [domain]
- [x] 12.2 Criar `SearchArtworksUseCase` com busca textual (nome, artista, endereço) e filtros combinados [domain]
- [x] 12.3 Implementar query drizzle com full-text search simulado e filtros AND [data]
- [x] 12.4 Criar `SearchScreen` com campo de busca e pills de filtro por tipo e estado [presentation]

## 13. Dashboard (capability: dashboard)

- [x] 13.1 [TEST] Escrever testes unitários para `GetDashboardStatsUseCase`: contagem correta por `conservation_status`, obras sem visita recente identificadas corretamente [domain]
- [x] 13.2 Criar `GetDashboardStatsUseCase` com contagem por `conservation_status` e obras sem visita recente [domain]
- [x] 13.3 [TEST] Escrever testes RNTL para `DashboardScreen`: cards renderizados por estado, toque em card navega para lista filtrada [presentation]
- [x] 13.4 Criar `DashboardScreen` com cards por estado e navegação para lista filtrada [presentation]

## 14. Perfil e Preferências

- [ ] 14.1 Criar `ProfileScreen` com dados do usuário (nome, avatar_url) e botão de logout [presentation]
- [ ] 14.2 Criar `PreferencesScreen` com seleção de idioma, threshold de revisita e configuração de tiles [presentation]
- [ ] 14.3 Implementar troca de idioma em runtime via i18next sem reiniciar o app [presentation]

## 15. Testes E2E (capability: e2e)

- [ ] 15.1 Configurar Maestro e escrever flow: login → cadastrar obra → inspecionar → gerar PDF [infrastructure]
- [ ] 15.2 Escrever flow Maestro: onboarding com permissão câmera concedida e localização concedida [infrastructure]
- [ ] 15.3 Escrever flow Maestro: cadastro de obra offline → reconexão → verificar sync [infrastructure]
