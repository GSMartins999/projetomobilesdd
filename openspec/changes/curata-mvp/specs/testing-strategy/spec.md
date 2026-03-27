## ADDED Requirements

### Requirement: Estratégia de Testes TDD

O projeto DEVE adotar Test-Driven Development (TDD) como padrão. Toda implementação SHALL ser precedida de um teste falhando (Red), seguida da implementação mínima (Green) e refatoração (Refactor).

#### Ciclo obrigatório por feature
- **DADO** que uma nova funcionalidade será iniciada
- **QUANDO** o desenvolvedor/IA começa a task
- **ENTÃO** DEVE:
  1. Escrever o(s) teste(s) que descrevem o comportamento esperado (Red)
  2. Rodar os testes e confirmar que falham
  3. Implementar o código mínimo para passar os testes (Green)
  4. Refatorar mantendo todos os testes passando (Refactor)

---

### Requirement: Ferramentas de Teste por Camada

| Camada | Ferramenta | Escopo |
|---|---|---|
| `domain/` | Jest puro | usecases, entities, schemas Zod, repositório de interfaces com mocks |
| `data/` | Jest + mocks | repositories, datasources (mock de drizzle/supabase) |
| `presentation/` | RNTL (React Native Testing Library) + `jest-expo` preset | screens, components, hooks |
| E2E | Maestro | fluxos críticos navegando na UI real |

#### Scenario: Configuração de infra de testes
- **DADO** que o projeto foi inicializado
- **QUANDO** a infra de testes for configurada (task 1.6)
- **ENTÃO** o projeto SHALL ter:
  - `jest.config.js` com preset `jest-expo`
  - `src/__mocks__/expo-camera.ts`, `expo-location.ts`, `expo-sqlite.ts`, `expo-secure-store.ts`, `@supabase/supabase-js.ts`
  - Script `"test": "jest"` e `"test:watch": "jest --watch"` no `package.json`
  - Threshold de cobertura: `{ domain: 80%, data: 70%, presentation: 70% }`

---

### Requirement: Mocks Obrigatórios

O projeto SHALL manter mocks estáticos para todas as libs nativas, permitindo rodar os testes sem simulador/dispositivo.

#### Scenario: Mock de expo-camera
- `expo-camera` → mock retorna `{ status: 'granted' }` por padrão; testes de estado negado devem sobrescrever com `jest.spyOn`

#### Scenario: Mock de expo-location
- `expo-location` → mock retorna `{ status: 'granted' }` e coordenadas fixas `{ latitude: -23.5505, longitude: -46.6333 }` por padrão

#### Scenario: Mock de expo-sqlite
- `expo-sqlite` → mock em memória com `better-sqlite3` ou objeto manual com `jest.fn()`

#### Scenario: Mock de expo-secure-store
- `expo-secure-store` → mock com `Map` em memória simulando key/value

#### Scenario: Mock de @supabase/supabase-js
- Supabase client → mock completo com `jest.fn()` retornando `{ data: null, error: null }` por padrão

---

### Requirement: Mapeamento Cenário BDD → Arquivo de Teste

Cada cenário das specs DEVE ter um arquivo de teste correspondente. Convenção de caminho:

| Spec | Arquivo de teste |
|---|---|
| `auth/spec.md` | `src/domain/usecases/__tests__/LoginUseCase.test.ts` |
| `auth/spec.md` | `src/presentation/screens/__tests__/LoginScreen.test.tsx` |
| `artwork-registration/spec.md` | `src/domain/usecases/__tests__/CreateArtworkUseCase.test.ts` |
| `artwork-registration/spec.md` | `src/domain/usecases/__tests__/DuplicateDetectionUseCase.test.ts` |
| `artwork-registration/spec.md` | `src/presentation/screens/__tests__/ArtworkFormScreen.test.tsx` |
| `inspection-form/spec.md` | `src/domain/usecases/__tests__/CreateInspectionUseCase.test.ts` |
| `inspection-form/spec.md` | `src/domain/schemas/__tests__/InspectionFormSchemaV1.test.ts` |
| `inspection-form/spec.md` | `src/presentation/screens/__tests__/InspectionFormScreen.test.tsx` |
| `offline-sync/spec.md` | `src/data/services/__tests__/SyncService.test.ts` |
| `map-view/spec.md` | `src/presentation/screens/__tests__/MapScreen.test.tsx` |
| `pdf-report/spec.md` | `src/domain/usecases/__tests__/GenerateReportUseCase.test.ts` |
| `search-filters/spec.md` | `src/domain/usecases/__tests__/SearchArtworksUseCase.test.ts` |
| `dashboard/spec.md` | `src/domain/usecases/__tests__/GetDashboardStatsUseCase.test.ts` |
| `dashboard/spec.md` | `src/presentation/screens/__tests__/DashboardScreen.test.tsx` |
| `permissions/spec.md` | `src/presentation/screens/__tests__/permissions/CameraPermission.test.tsx` |
| `permissions/spec.md` | `src/presentation/screens/__tests__/permissions/LocationPermission.test.tsx` |
| `onboarding/spec.md` | `src/presentation/screens/__tests__/OnboardingScreen.test.tsx` |

---

### Requirement: Cobertura Mínima por Camada

O sistema SHALL manter threshold de coverage configurado no `jest.config.js`:

```json
{
  "coverageThreshold": {
    "src/domain/**": { "lines": 80, "functions": 80 },
    "src/data/**":   { "lines": 70, "functions": 70 },
    "src/presentation/**": { "lines": 70, "functions": 70 }
  }
}
```

#### Scenario: Coverage abaixo do threshold
- **DADO** que o pipeline de CI roda `jest --coverage`
- **QUANDO** a cobertura de qualquer camada fica abaixo do threshold
- **ENTÃO** o pipeline DEVE falhar com mensagem indicando a camada e o percentual atual

---

### Requirement: Testes E2E com Maestro

Os testes E2E SHALL cobrir o fluxo crítico completo de forma automatizada.

#### Scenario: Fluxo crítico E2E
- **DADO** que o app está instalado em simulador com Maestro
- **QUANDO** o fluxo `login → cadastrar obra → inspecionar → gerar PDF` é executado
- **ENTÃO** cada passo DEVE completar sem erros de navegação ou de dados

#### Scenario: Fluxo de permissões E2E
- **DADO** que o app é instalado pela primeira vez
- **QUANDO** o onboarding é executado
- **ENTÃO** os diálogos de câmera e localização DEVEM aparecer nos slides corretos (slide 2 e 3)
