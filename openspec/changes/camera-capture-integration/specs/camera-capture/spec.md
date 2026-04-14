## ADDED Requirements

### Requirement: Camera permission request
O sistema SHALL solicitar permissão de acesso à câmera antes de abrir o visualizador. Se a permissão já foi concedida, o fluxo prossegue diretamente.

#### Scenario: Permissão concedida no primeiro pedido
- **WHEN** o usuário toca no botão de câmera e nenhuma permissão foi solicitada antes
- **THEN** o sistema exibe o diálogo de permissão do SO e ao confirmar abre o visualizador da câmera

#### Scenario: Permissão já concedida anteriormente
- **WHEN** o usuário toca no botão de câmera e a permissão já estava concedida
- **THEN** o sistema abre o visualizador da câmera sem exibir diálogo de permissão

#### Scenario: Permissão negada
- **WHEN** o usuário nega a permissão de câmera
- **THEN** o sistema exibe alerta explicativo e não abre o visualizador

### Requirement: Live camera preview
O sistema SHALL exibir um visualizador ao vivo da câmera traseira do dispositivo em modo retrato.

#### Scenario: Abertura do visualizador
- **WHEN** a permissão está concedida e o componente `CameraCapture` é montado
- **THEN** o feed ao vivo da câmera traseira é exibido em tela cheia

### Requirement: Photo capture
O sistema SHALL capturar uma foto quando o usuário acionar o botão de captura. A foto DEVE ser comprimida para no máximo 1200px e ~300KB antes de ser salva.

#### Scenario: Captura com sucesso
- **WHEN** o usuário toca no botão de captura
- **THEN** o sistema fecha o shutter, exibe o preview da foto e aguarda confirmação

#### Scenario: Preview confirmado
- **WHEN** o usuário toca em "Confirmar" na tela de preview
- **THEN** a foto é comprimida, salva no file system local e `onPhotoTaken(localPath)` é chamado

#### Scenario: Preview rejeitado
- **WHEN** o usuário toca em "Tirar novamente" na tela de preview
- **THEN** o sistema volta ao visualizador ao vivo descartando a foto anterior

### Requirement: Cancel camera flow
O sistema SHALL permitir que o usuário cancele o fluxo de câmera e retorne à tela anterior sem capturar nenhuma foto.

#### Scenario: Cancelamento
- **WHEN** o usuário toca no botão "Cancelar"
- **THEN** `onCancel()` é chamado e o componente `CameraCapture` é desmontado

### Requirement: Local photo persistence
Após confirmação, o use case `CapturePhotoUseCase` SHALL salvar a entidade `Photo` via `PhotoRepository` com `uploadStatus: 'pending'` e `syncedAt: null`.

#### Scenario: Persistência local
- **WHEN** `CapturePhotoUseCase.execute()` é chamado com o `localPath` da foto comprimida
- **THEN** um registro `Photo` é criado com `uploadStatus: 'pending'`, `syncedAt: null` e `deletedAt: null`

#### Scenario: Múltiplas fotos
- **WHEN** o usuário captura múltiplas fotos em uma inspeção
- **THEN** cada foto gera um registro `Photo` independente com `order` sequencial
