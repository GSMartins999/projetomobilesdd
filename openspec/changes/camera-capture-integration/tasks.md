## 1. Configurações e Permissões

- [ ] 1.1 [infrastructure] Adicionar `NSCameraUsageDescription` e permissão `android.permission.CAMERA` em `app.json`
- [ ] 1.2 [infrastructure] Expandir mock `src/__mocks__/expo-camera.ts` adicionando `takePictureAsync` e `requestCameraPermissionsAsync` com controle de retorno por teste

## 2. Domain — CapturePhotoUseCase (TDD)

- [ ] 2.1 [TEST][domain] Escrever `CapturePhotoUseCase.test.ts` com cenários RED: permissão negada lança `PermissionDeniedError`; captura com sucesso salva `Photo` com `uploadStatus: 'pending'`; múltiplas fotos geram registros com `order` sequencial
- [ ] 2.2 [domain] Criar interface `ICameraService` em `src/domain/services/CameraService.ts` com métodos `requestPermission(): Promise<boolean>` e `takePicture(): Promise<string>`
- [ ] 2.3 [domain] Implementar `CapturePhotoUseCase` em `src/domain/usecases/CapturePhotoUseCase.ts` para passar os testes (GREEN)
- [ ] 2.4 [domain] Refatorar `CapturePhotoUseCase` se necessário (REFACTOR) — garantir que os testes continuam passando

## 3. Infrastructure — CameraService

- [ ] 3.1 [TEST][infrastructure] Escrever `CameraServiceImpl.test.ts` com cenários: permissão negada retorna `false`; `takePicture` retorna `localPath` válido; `takePicture` falha com erro de hardware lança `CameraError`
- [ ] 3.2 [infrastructure] Implementar `CameraServiceImpl` em `src/infrastructure/camera/CameraServiceImpl.ts` usando `expo-camera` + `expo-image-manipulator` (compressão 1200px / qualidade 0.7)
- [ ] 3.3 [infrastructure] Salvar resultado comprimido em `expo-file-system` no diretório `FileSystem.documentDirectory + 'photos/'` garantindo nome único por UUID

## 4. Presentation — Componente CameraCapture

- [ ] 4.1 [TEST][presentation] Escrever `CameraCapture.test.tsx` com RNTL: testa renderização com permissão negada (exibe alerta); renderização com permissão concedida (exibe preview ao vivo); botão de captura chama `onPhotoTaken`; botão cancelar chama `onCancel`
- [ ] 4.2 [presentation] Criar componente `CameraCapture` em `src/presentation/components/CameraCapture.tsx` com props: `onPhotoTaken(localPath: string): void`, `onCancel(): void`, `artworkId: string`, `inspectionId?: string`, `order?: number`
- [ ] 4.3 [presentation] Implementar feedback visual: animação de shutter ao capturar, tela de preview com botões "Confirmar" e "Tirar novamente"

## 5. Presentation — Tela CameraScreen (opcional standalone)

- [ ] 5.1 [TEST][presentation] Escrever `CameraScreen.test.tsx` testando montagem, fluxo de permissão e retorno via `navigation.goBack()`
- [ ] 5.2 [presentation] Criar `CameraScreen` em `src/presentation/screens/CameraScreen.tsx` que envolve `CameraCapture` para uso via navegação stack, recebendo `artworkId` e `inspectionId` como route params

## 6. Integração em CreateArtworkScreen

- [ ] 6.1 [TEST][presentation] Adicionar testes na suite de `CreateArtworkScreen` (ou criar `CreateArtworkScreen.test.tsx`): botão "Adicionar Foto" monta `CameraCapture`; após `onPhotoTaken`, thumbnail aparece na lista; ao submeter com foto, `CapturePhotoUseCase` é chamado após `CreateArtworkUseCase`
- [ ] 6.2 [presentation] Adicionar botão "Adicionar Foto" em `CreateArtworkScreen` que monta `CameraCapture` como modal
- [ ] 6.3 [presentation] Exibir lista de thumbnails das fotos capturadas antes do submit
- [ ] 6.4 [presentation] Ao confirmar o form, executar `CreateArtworkUseCase` e depois `CapturePhotoUseCase` para cada photo com `artworkId` retornado

## 7. Integração em CreateInspectionScreen

- [ ] 7.1 [TEST][presentation] Adicionar testes em `CreateInspectionScreen`: botão "Adicionar Foto" monta `CameraCapture`; thumbnails aparecem na lista; remoção de foto remove do state; ao salvar, fotos passadas para `CreateInspectionUseCase`
- [ ] 7.2 [presentation] Adicionar botão "Adicionar Foto" com contador em `CreateInspectionScreen`
- [ ] 7.3 [presentation] Exibir grid de thumbnails com ícone de remoção
- [ ] 7.4 [presentation] Integrar lista de `localPath` na chamada existente de `CreateInspectionUseCase.execute({ photos: [...] })`

## 8. DI — Registrar CameraService no Contexto

- [ ] 8.1 [infrastructure] Exportar `CameraServiceImpl` como factory em `src/infrastructure/di/DIContext.tsx` (ou arquivo de factories existente)
- [ ] 8.2 [infrastructure] Injetar `ICameraService` em `CreateArtworkScreen` e `CreateInspectionScreen` via hook `useDI()` ou prop drilling mínimo

## 9. Verificação Final

- [ ] 9.1 Executar `npx jest --coverage` em `curata-app` e confirmar que os novos testes passam e cobertura de `domain/usecases` e `infrastructure/camera` ≥ 80%
- [ ] 9.2 Verificar que o mock `expo-camera` não interfere nos testes existentes (rodar suite completa)
