## Context

O Curata é um app mobile novo, construído do zero sobre Expo SDK 52 + React Native + TypeScript com Clean Architecture estrita. Não existe código prévio. O design cobre a arquitetura completa do MVP: 4 entidades de dados, 12 capabilities, 18 telas e estratégia de sync offline-first.

O usuário é profissional solo de conservação/restauração de arte que trabalha em campo, frequentemente sem internet, com dispositivos iOS ou Android.

> **Nota de build:** O projeto usa **Expo Dev Client** (não Managed Workflow puro) desde o início, para suportar react-native-maplibre (renderização GL nativa).

## Goals / Non-Goals

**Goals:**
- Definir a arquitetura de dados (4 entidades: ARTWORK, INSPECTION, PHOTO, USER)
- Definir a estratégia de sincronização offline → Supabase com soft delete e conflict resolution
- Definir a estrutura de navegação (Stack + Bottom Tab)
- Definir o contrato de DI via Context API + factories
- Definir a estratégia de armazenamento de fotos (local + remoto)
- Definir o modelo de IDs (UUID interno + display_id gerado no servidor)

**Non-Goals:**
- Colaboração em equipe (v2)
- Integração IPHAN / registros oficiais (v2)
- QR Code nas obras (v2)
- Modo público / mapa comunitário (v2)

## Decisions

### D1 — Clean Architecture estrita com 4 camadas

```
src/
├── domain/          → entidades, usecases, interfaces de repositório
├── data/            → implementações de repositório, datasources (local + remote)
├── presentation/    → screens, components, hooks
└── infrastructure/  → DI (Context API), navigation, i18n
```

**Motivo:** Isola lógica de negócio das libs externas (Supabase, drizzle, expo). Facilita testes do domain sem mocks de infraestrutura.

---

### D2 — DI via Context API + factories (não tsyringe)

Cada repositório é instanciado em um factory e injetado via React Context. Screens consomem via hooks (`useArtworkRepository`, `useSyncService`).

**Motivo:** tsyringe e inversify dependem de `reflect-metadata` + decoradores que conflitam com o Metro bundler do Expo. Context API é idiomático e testável com mocks simples.

---

### D3 — Modelo de dados com 4 entidades e campos de sync universais

Toda entidade possui: `id (UUID)`, `updated_at`, `synced_at`, `deleted_at`, `device_id`.

| Entidade | Descrição |
|---|---|
| `ARTWORK` | Obra de arte com geolocalização e estado de conservação |
| `INSPECTION` | Registro de visita técnica a uma obra |
| `PHOTO` | Foto de inspeção com caminho local e URL remota |
| `USER` | Espelho mínimo do Supabase Auth para uso offline |

`display_id` (ART-YYYY-XXXXX) é gerado pelo servidor no primeiro sync — nunca pelo cliente — evitando colisões entre devices.

---

### D4 — Sync offline-first: last-write-wins + soft delete

- **Source of truth local:** SQLite via drizzle-orm
- **Conflito:** last-write-wins por `updated_at` (timestamp da ação do usuário)
- **Deleção:** sempre via `deleted_at` — nunca deleção física em nenhuma camada
- **Fotos:** upload por partes com estado `pending | uploading | done | failed` em PHOTO

**Motivo:** CRDT seria over-engineering para usuário solo. Last-write-wins é suficiente e simples de auditar.

---

### D4b — JWT expirado offline: janela de graça de 7 dias

Se o JWT expirar e não houver conexão para renová-lo:
- O app exibe um **banner de aviso** persistente: *"Sessão expirada — reconecte para sincronizar"*
- O acesso aos dados locais **não é bloqueado** por até **7 dias** após a expiração
- Após 7 dias sem renovação, o app exige novo login

**Motivo:** Bloquear offline imediatamente torna o app inutilizável em campo estendido — cenário central de uso da profissional.

---

### D4c — Propagação de `conservation_status` após inspeção

O `CreateInspectionUseCase` deve, após salvar a inspeção com sucesso, **atualizar o `conservation_status` da obra-mãe** com o `status_at_visit` da nova inspeção (e atualizar `updated_at` da obra).

**Motivo:** O status da obra deve sempre refletir a avaliação técnica mais recente, sem exigir ação manual da profissional.

---

### D5 — Mapa com react-native-maplibre (não Leaflet, não react-native-maps)

**Motivo:** Leaflet é biblioteca web (DOM) — incompatível com RN nativo. react-native-maps não tem suporte real a tiles offline. react-native-maplibre oferece rendering GL nativo e download de tiles offline sem WebView.

---

### D6 — Fotos: expo-file-system (local) + Supabase Buckets (remoto)

Fluxo:
1. Câmera captura → comprime (max 1200px / 300KB) → salva em `expo-file-system`
2. PHOTO criada com `local_path` + `upload_status: pending`
3. No sync → upload para Supabase Bucket → `remote_url` preenchida + `upload_status: done`
4. Exibição: usa `local_path` se offline, `remote_url` se online

**Motivo:** URL do Supabase não funciona sem internet. Cache local é obrigatório para experiência offline coerente.

---

### D7 — `technical_form` como JSON + validação Zod + `form_version`

O formulário técnico de inspeção é serializado como JSON no campo `technical_form` de INSPECTION. O schema é validado por um `InspectionFormSchema` (Zod) na camada domain.

A entidade INSPECTION recebe um campo adicional: **`form_version: integer`** (default `1`). O domain mantém um mapa de schemas por versão (`InspectionFormSchemaV1`, `InspectionFormSchemaV2`, …) e seleciona o schema correto ao ler uma inspeção antiga.

**Motivo:** Tabela separada aumenta complexidade de migrations. JSON + Zod é simples para v1 e o `form_version` garante que inspeções antigas não falhem quando o schema evoluir.

---

### D8 — Navegação: Stack aninhado em Bottom Tab

```
RootStack
├── Splash (sistema)
├── Auth Stack → Login, Onboarding
└── App Tab Navigator
    ├── Tab: Mapa → MapScreen, ArtworkDetailScreen
    ├── Tab: Lista → ArtworkListScreen, ArtworkDetailScreen
    ├── Tab: Dashboard → DashboardScreen
    └── Tab: Perfil → ProfileScreen, PreferencesScreen
    
Modal Stack (sobre qualquer tab):
├── NewArtworkFlow → CameraScreen → ArtworkFormScreen
├── InspectionFormScreen
├── ReportGeneratorScreen → PDFPreviewScreen
├── SearchScreen
└── NotificationsScreen
```

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `updated_at` incorreto (relógio do device) → conflito silencioso | Validar no servidor que `updated_at` não é data futura; adicionar `device_id` para auditoria |
| react-native-maplibre — curva de aprendizado (configuração de tiles offline) | Testar download de tiles no início do projeto, antes de outras features |
| drizzle-orm com expo-sqlite — integração ainda relativamente nova | Criar um spike de migration antes de modelar todas as entidades |
| Supabase Storage free tier (1GB) pode ser atingido rapidamente com fotos | Compressão obrigatória (300KB/foto) + limite de 10 fotos por inspeção |
| react-native-maplibre exige módulo GL nativo | **Resolvido: Expo Dev Client adotado desde o início** |

## Limitações Explícitas (v1)

- **Notificações:** verificação de obras sem revisita roda **apenas ao abrir o app** — sem background task. Se o app não for aberto, nenhuma notificação é disparada naquele dia.
- **JWT grace period:** o acesso offline é mantido por até 7 dias após expiração do token, com banner de aviso persistente.
