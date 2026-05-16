# Design: Fix Post-Merge Issues

## Approach

### 1. Schema: Adicionar `monument` ao tipo de artwork

No `data/db/schema.ts`, a definição do campo `type` da tabela `artworks` usa `$type<>()` com um union literal que não inclui `'monument'`. A entidade no domain (`Artwork.ts`) já o inclui.

**Solução:** Atualizar a linha 17 do schema:
```typescript
// Antes
type: text('type').$type<'painting' | 'sculpture' | 'mural' | 'tile' | 'relief' | 'other'>().notNull(),

// Depois
type: text('type').$type<'painting' | 'sculpture' | 'mural' | 'tile' | 'relief' | 'monument' | 'other'>().notNull(),
```

Não é necessário migration SQL — o SQLite armazena como `TEXT` sem constraint de enum. Apenas o tipo TypeScript do Drizzle precisa ser atualizado.

### 2. Photo.inspectionId: nullable em todas as camadas

A feature de foto direta na obra (sem inspeção) requer que `inspectionId` aceite `null`. São **3 pontos** a alterar:

1. **Entity** (`domain/entities/Inspection.ts:8`):
   ```typescript
   inspectionId: string | null;
   ```

2. **Schema** (`data/db/schema.ts:42`):
   ```typescript
   // Remover .notNull() e remover a foreign key (fotos podem existir sem inspeção)
   inspectionId: text('inspection_id'),
   ```

3. **Repositório** (`data/repositories/PhotoRepositoryImpl.ts`): nenhuma mudança necessária — já usa `photo.inspectionId` sem assumir non-null.

### 3. ArtworkFormScreen: handleSave → onPress wrapper

O `handleSave` tem assinatura `(forceCreate?: boolean) => Promise<void>`. Quando passado diretamente ao `onPress`, o React Native envia o `GestureResponderEvent` como primeiro argumento, que é truthy — desabilitando silenciosamente a detecção de duplicatas.

**Solução:** Envolver em uma arrow function:
```tsx
// Antes
onPress={handleSave}

// Depois
onPress={() => handleSave()}
```

### 4. DashboardScreen: createdAt → updatedAt

A entidade `Inspection` não possui `createdAt`. Todas as referências a `item.createdAt` devem ser substituídas por `item.updatedAt`, que é o campo correto para ordenação cronológica.

Linhas afetadas: 29 (sort) e 165 (exibição de data).

### 5. expo-file-system: migração de API deprecated

No SDK 54, `FileSystem.EncodingType` e `FileSystem.documentDirectory` foram movidos. A solução:

**SyncServiceImpl.ts** (`EncodingType`):
```typescript
// Antes
import * as FileSystem from 'expo-file-system';
FileSystem.EncodingType.Base64

// Depois
import { readAsStringAsync, EncodingType } from 'expo-file-system';
EncodingType.Base64
```

**CreateInspectionUseCase.ts** (`documentDirectory`):
```typescript
// Antes
FileSystem.documentDirectory

// Depois  
import { documentDirectory, copyAsync } from 'expo-file-system';
documentDirectory
```

**Supabase upload** (`upscale` option):
Remover a opção `upscale: false` que não existe no tipo `FileOptions` do Supabase.

### 6. Testes: atualizar mocks e imports

| Arquivo | Problema | Fix |
|---|---|---|
| `CreateInspectionUseCase.test.ts` | Mock de `InspectionRepository` falta `update`, `findAll` | Adicionar `update: jest.fn()`, `findAll: jest.fn()` |
| `CreateInspectionUseCase.test.ts` | Mock de `PhotoRepository` falta `findByArtworkId`, `findById`, `update`, `findUnsynced` | Adicionar os 4 mocks |
| `LogoutUseCase.test.ts` | Import path errado para `AuthRepository` | Corrigir para `../../../domain/repositories/AuthRepository` |
| `AuthContext.test.tsx` | Import de `User` com path inválido | Corrigir para `../../../domain/entities/User` |
| `SmokeTests.test.tsx` | `PdfPreviewScreen` recebe `route` mas tipo não aceita | Adicionar tipo ao componente ou cast `as any` |

## Decisões de Design

- **Não criar migration SQL** para o tipo `monument`: SQLite armazena TEXT sem enum, então a mudança é puramente de tipo TypeScript.
- **Remover a foreign key** de `photos.inspectionId → inspections.id`: fotos diretas na obra não têm inspeção vinculada, e o FK constraint bloquearia isso.
- **Manter `updatedAt` como proxy de `createdAt`**: não adicionamos um campo novo — a primeira escrita do `updatedAt` já funciona como data de criação.
