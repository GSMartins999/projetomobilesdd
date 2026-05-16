# Tasks: Fix Post-Merge Issues

## P0 — Bugs de Runtime (Crash / Lógica Errada)

- [x] **[FIX] Schema: adicionar `monument` ao tipo artwork** *(data)*
  - Arquivo: `data/db/schema.ts`
  - Adicionar `'monument'` ao `$type<>()` do campo `type` da tabela `artworks`
  - Critério: `npx tsc --noEmit` não mostra erro em `ArtworkRepositoryImpl.ts:51` e `:76`

- [x] **[FIX] Photo.inspectionId nullable** *(domain + data)*
  - Arquivos: `domain/entities/Inspection.ts`, `data/db/schema.ts`
  - Mudar `inspectionId: string` para `string | null` na entity
  - Remover `.notNull()` e `.references()` do campo `inspection_id` no schema
  - Critério: `npx tsc --noEmit` não mostra erro em `CreateArtworkUseCase.ts:88`

- [x] **[FIX] ArtworkFormScreen handleSave onPress** *(presentation)*
  - Arquivo: `presentation/screens/ArtworkFormScreen.tsx`
  - Mudar `onPress={handleSave}` para `onPress={() => handleSave()}`
  - Critério: `npx tsc --noEmit` não mostra erro em `ArtworkFormScreen.tsx:246`; detecção de duplicatas funciona em runtime

## P1 — Bugs de UI / API Deprecated

- [x] **[FIX] DashboardScreen createdAt → updatedAt** *(presentation)*
  - Arquivo: `presentation/screens/DashboardScreen.tsx`
  - Substituir `item.createdAt` por `item.updatedAt` nas linhas 29 e 165
  - Critério: `npx tsc --noEmit` sem erros em `DashboardScreen.tsx`; dashboard exibe datas válidas

- [x] **[FIX] expo-file-system APIs deprecated** *(data + domain)*
  - Arquivos: `data/services/SyncServiceImpl.ts`, `domain/usecases/CreateInspectionUseCase.ts`
  - Migrar `FileSystem.EncodingType` para import nomeado
  - Migrar `FileSystem.documentDirectory` para import nomeado
  - Remover `upscale: false` do upload Supabase
  - Critério: `npx tsc --noEmit` sem erros nesses arquivos

## P2 — Testes Quebrados

- [x] **[TEST] Atualizar mocks de repositórios nos testes** *(domain tests)*
  - Arquivo: `domain/usecases/__tests__/CreateInspectionUseCase.test.ts`
  - Adicionar `update: jest.fn()`, `findAll: jest.fn()` ao mock de InspectionRepository
  - Adicionar `findByArtworkId: jest.fn()`, `findById: jest.fn()`, `update: jest.fn()`, `findUnsynced: jest.fn()` ao mock de PhotoRepository
  - Critério: `npm test -- CreateInspectionUseCase` passa

- [x] **[TEST] Corrigir imports em LogoutUseCase.test.ts** *(domain tests)*
  - Arquivo: `domain/usecases/__tests__/LogoutUseCase.test.ts`
  - Corrigir path de import do `AuthRepository`
  - Critério: `npm test -- LogoutUseCase` passa

- [x] **[TEST] Corrigir imports em AuthContext.test.tsx** *(infrastructure tests)*
  - Arquivo: `infrastructure/auth/__tests__/AuthContext.test.tsx`
  - Corrigir path de import da entity `User`
  - Critério: `npm test -- AuthContext` passa

- [x] **[TEST] Corrigir SmokeTests PdfPreviewScreen** *(presentation tests)*
  - Arquivo: `presentation/screens/__tests__/SmokeTests.test.tsx`
  - Corrigir tipagem de props do `PdfPreviewScreen`
  - Critério: `npm test -- SmokeTests` passa

## Validação Final

- [x] **[VERIFY] Compilação limpa**
  - Rodar `npx tsc --noEmit` — deve retornar 0 erros
  
- [x] **[VERIFY] Testes passam**
  - Rodar `npm test` — todos os testes devem passar

- [x] **[VERIFY] App roda no Expo Go**
  - Rodar `npx expo start` e testar no dispositivo: cadastrar obra monument, tirar foto, ver dashboard

