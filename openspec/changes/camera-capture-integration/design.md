## Context

O Curata usa Clean Architecture estrita. Fotos já fazem parte do modelo de dados via `Photo` entity e `PhotoRepository`, e o mock de `expo-camera` já existe em `__mocks__/expo-camera.ts`. Porém não há nenhuma tela ou componente funcional que abra a câmera, capture uma foto, salve no file system local e associe à entidade. O uso é offline-first: a foto é salva localmente primeiro e enviada ao Supabase Storage pelo `SyncServiceImpl` já existente.

## Goals / Non-Goals

**Goals:**
- Implementar `CapturePhotoUseCase` no domain com TDD completo (Red-Green-Refactor)
- Criar `CameraService` na infrastructure isolando `expo-camera` e `expo-file-system`
- Criar `CameraScreen` e componente `CameraCapture` na presentation
- Integrar câmera nos formulários de cadastro de obra e inspeção
- Configurar permissões de câmera no `app.json` para iOS e Android
- Expandir mock de `expo-camera` para cobrir `takePictureAsync`

**Non-Goals:**
- Upload da foto ao Supabase Storage (responsabilidade do `SyncServiceImpl` existente)
- Câmera frontal ou outras câmeras (apenas câmera traseira no v1)
- Gravação de vídeo
- QR Code ou leitura de câmera

## Decisions

### 1. `CameraService` na camada de infrastructure (não data)
**Decisão**: O `CameraService` vive em `infrastructure/camera/` (não em `data/`), pois é uma abstração de hardware/plataforma, não de persistência.  
**Alternativa considerada**: Colocar em `data/` como os repositórios — mas isso misturaria acesso a hardware com acesso a dados.  
**Rationale**: Segue o padrão já estabelecido com `infrastructure/auth/` (AuthContext) e `infrastructure/navigation/`.

### 2. `CapturePhotoUseCase` apenas orquestra serviço + repositório
**Decisão**: O use case recebe um `CameraService` (interface) e `PhotoRepository`, solicita a captura, comprime, salva localmente e persiste a entidade `Photo`.  
**Alternativa considerada**: Fazer a lógica diretamente no componente — violaria Clean Architecture.  
**Rationale**: Tornar o use case testável em isolamento (domain puro, sem dependência de `expo-camera`).

### 3. Interface `ICameraService` no domain
**Decisão**: Definir `ICameraService` como interface em `domain/services/CameraService.ts` e implementar em `infrastructure/camera/CameraServiceImpl.ts`.  
**Rationale**: O use case depende de abstrações, não de implementações — permite mock total em testes TDD.

### 4. Componente `CameraCapture` como modal reutilizável
**Decisão**: `CameraCapture` é um componente modal (overlay de tela cheia) que recebe `onPhotoTaken(localPath: string)` e `onCancel()` como props.  
**Alternativa considerada**: Tela dedicada via navigation stack — gera overhead de rota para um fluxo modal.  
**Rationale**: Mais simples de integrar em `CreateArtworkScreen` e `CreateInspectionScreen` sem alterar o stack de navegação.

### 5. Compressão antes de salvar: `expo-image-manipulator`
**Decisão**: Usar `expo-image-manipulator` (já em `package.json`) para redimensionar para max 1200px e comprimir para ~300KB antes de salvar em `expo-file-system`.  
**Rationale**: Consistente com a estratégia de sync da especificação: "compressão antes do upload (max 1200px / 300KB)".

### 6. TDD com ciclo Red-Green-Refactor
- `CapturePhotoUseCase.test.ts` escrito **antes** da implementação
- `CameraCapture.test.tsx` com RNTL — testa permissões negadas, permissão concedida, fluxo de captura e cancelamento
- Mock de `expo-camera` expandido para `takePictureAsync`

## Risks / Trade-offs

- **[Risco] Permissão de câmera negada** → O `CapturePhotoUseCase` retorna erro tipado `PermissionDeniedError`; a UI exibe alerta com link para configurações.
- **[Risco] Arquivo não encontrado após captura** → `CameraService` valida a existência do arquivo antes de retornar; lança `CameraError` se inválido.
- **[Trade-off] Modal vs. Stack Screen** → Modal é mais simples mas bloqueia navegação; aceitável para v1 (uso rápido desde o formulário).
- **[Risco] Memória com previews grandes** → Compressão obrigatória antes de salvar; thumbnails gerados separadamente se necessário no v2.
