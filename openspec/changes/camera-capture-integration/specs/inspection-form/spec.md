## MODIFIED Requirements

### Requirement: Inspection photo capture
O formulário de inspeção SHALL permitir captura de múltiplas fotos via câmera. Cada foto está associada à inspeção via `Photo.inspectionId` e à obra via `Photo.artworkId`.

#### Scenario: Abertura da câmera no formulário de inspeção
- **WHEN** o usuário está na tela `CreateInspectionScreen` e toca em "Adicionar Foto"
- **THEN** o componente `CameraCapture` é exibido em modal sobre o formulário

#### Scenario: Foto adicionada à inspeção
- **WHEN** o usuário confirma uma foto no `CameraCapture`
- **THEN** o `localPath` é adicionado à lista de fotos pendentes exibida no formulário com thumbnail

#### Scenario: Múltiplas fotos na inspeção
- **WHEN** o usuário adiciona várias fotos
- **THEN** cada foto aparece como thumbnail na lista e cada uma gerará um registro `Photo` separado

#### Scenario: Remoção de foto pendente
- **WHEN** o usuário toca no ícone de remover sobre uma foto pendente
- **THEN** o `localPath` é removido da lista; se a foto já foi salva localmente, o arquivo NÃO é deletado (limpeza de arquivos é responsabilidade do SyncService)

#### Scenario: Salvar inspeção com fotos
- **WHEN** o usuário confirma a inspeção com fotos pendentes
- **THEN** `CreateInspectionUseCase` já persiste as fotos (comportamento existente em `CreateInspectionUseCase`) com `artworkId` e `inspectionId` preenchidos
