## Why

O app Curata já prevê o uso de `expo-camera` para fotografar obras e inspeções, mas a integração da câmera na UI ainda não foi implementada — as fotos são referenciadas na entidade `Photo`, porém não há tela, componente ou use case de captura funcional. Isso bloqueia o fluxo principal de registro de obras com evidência fotográfica.

## What Changes

- Criação do use case `CapturePhotoUseCase` (domain) com ciclo TDD completo
- Criação do serviço `CameraService` na camada de infraestrutura para isolar `expo-camera` e `expo-file-system`
- Criação do componente `CameraScreen` (presentation/screens) com visualizador de câmera, botão de captura, preview e confirmação
- Criação do componente reutilizável `CameraCapture` para ser embutido em outras telas (InspeçãoForm, CadastroObra)
- Integração da câmera no `CreateInspectionScreen` e `CreateArtworkScreen`
- Permissões de câmera configuradas via `app.json` (iOS NSCameraUsageDescription, Android CAMERA)
- Mock de `expo-camera` já existente em `__mocks__/expo-camera.ts` — expandir e confirmar cobertura

## Capabilities

### New Capabilities
- `camera-capture`: Captura de foto via câmera do dispositivo, salvamento local com `expo-file-system` e associação à entidade `Photo`. Inclui solicitação de permissão, preview ao vivo, confirmação/rejeição e compressão da imagem.

### Modified Capabilities
- `artwork-registration`: Integração do fluxo de captura de foto ao formulário de cadastro de obra (`CreateArtworkScreen`), permitindo anexar fotos no momento do cadastro.
- `inspection-form`: Integração do fluxo de captura de foto ao formulário de inspeção (`CreateInspectionScreen`), substituindo o placeholder atual por câmera real.

## Impact

- **domain/usecases**: novo `CapturePhotoUseCase.ts`
- **domain/repositories**: interface `PhotoRepository` (já existe) — sem mudança de contrato
- **infrastructure**: novo `CameraService.ts` isolando `expo-camera` e `expo-file-system`
- **presentation/screens**: novo `CameraScreen.tsx`; modificações em `CreateArtworkScreen.tsx` e `CreateInspectionScreen.tsx`
- **presentation/components**: novo `CameraCapture.tsx`
- **app.json**: permissões de câmera para iOS e Android
- **__mocks__/expo-camera.ts**: expansão do mock para suportar `takePictureAsync`
- **Dependências**: `expo-camera` e `expo-file-system` já listadas em `package.json` — nenhuma dependência nova necessária
