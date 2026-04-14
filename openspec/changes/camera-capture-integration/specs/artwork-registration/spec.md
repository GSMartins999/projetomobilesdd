## MODIFIED Requirements

### Requirement: Artwork photo attachment
O fluxo de cadastro de obra SHALL permitir que o usuário adicione fotos capturadas via câmera antes de salvar a obra. As fotos são associadas à obra recém-criada via `Photo.artworkId`.

#### Scenario: Abertura da câmera durante cadastro
- **WHEN** o usuário está na tela `CreateArtworkScreen` e toca no botão "Adicionar Foto"
- **THEN** o componente `CameraCapture` é exibido em modal sobre o formulário

#### Scenario: Foto adicionada ao formulário
- **WHEN** o usuário confirma uma foto no `CameraCapture`
- **THEN** o `localPath` é adicionado à lista de fotos pendentes exibida no formulário

#### Scenario: Cadastro da obra com fotos
- **WHEN** o usuário confirma o cadastro da obra com fotos pendentes
- **THEN** `CreateArtworkUseCase` é executado primeiro, depois `CapturePhotoUseCase` é executado para cada localPath com o `artworkId` gerado, criando registros `Photo` com `uploadStatus: 'pending'`

#### Scenario: Cadastro da obra sem fotos
- **WHEN** o usuário confirma o cadastro da obra sem adicionar fotos
- **THEN** `CreateArtworkUseCase` é executado normalmente sem criação de registros `Photo`
