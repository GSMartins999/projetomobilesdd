# Design: Fix Architecture Flaws

## Approach

### 1. Clock Skew na Sincronização
No `SyncServiceImpl.ts`, não usaremos mais `new Date().toISOString()`. Ao baixar os itens da tabela (`Download: Server -> Local`), pegaremos o maior `updated_at` retornado pelas rows baixadas. O timestamp para `sync_state` passará a ser esse valor máximo. Caso o download não retorne nada (e houve uploads), precisaremos obter o timestamp do servidor, ou manter o local, lidando com segurança.

### 2. Fotos na Pasta Permanente
Antes de chamar o UseCase no `handleSave` da `InspectionFormScreen` (ou dentro do próprio repositório/caso de uso), usaremos `expo-file-system`:
```typescript
import * as FileSystem from 'expo-file-system';
const filename = photo.localPath.split('/').pop();
const dest = FileSystem.documentDirectory + filename;
await FileSystem.copyAsync({ from: photo.localPath, to: dest });
```
E então salva `dest` no banco em vez do path do cache temporário, assegurando que o OS não deletará as fotos antes do upload.

### 3. Falso-Positivo de Duplicatas
No `CreateArtworkUseCase.ts`, adicionaremos na interface de entrada a propriedade `forceCreate?: boolean`. Se `forceCreate` for falso e `findNearby` achar algo num raio < 30m, lançaremos um `throw new Error('DUPLICATE_DETECTED')`. A tela tratará esse erro alertando o usuário, que poderá refazer a submissão ativando a flag.

### 4. Instanciação Incessante no React
Nos componentes baseados em hooks (ex: formulários e telas de detalhe), qualquer classe (como UseCases) será injetada usando `useMemo` com os Repositórios de dependência:
```tsx
const createArtworkUseCase = useMemo(() => new CreateArtworkUseCase(artworkRepository, ...), [artworkRepository]);
```
Isso eliminará a alocação de objetos em cada ciclo de re-render da digitação de teclado.

### 5. Migrações Delta com PRAGMA user_version
No `client.ts`, antes do bloco `CREATE TABLE`, extrairemos a versão atual do SQLite local:
```typescript
const { user_version } = expoDb.getFirstSync<{ user_version: number }>('PRAGMA user_version');
if (user_version === 0) {
    // Tabela inicial
    expoDb.execSync('PRAGMA user_version = 1');
}
// Futuras versões:
// if (user_version === 1) { expoDb.execSync('ALTER TABLE...'); }
```
Isso garantirá uma base segura para manutenibilidade após a V1.
