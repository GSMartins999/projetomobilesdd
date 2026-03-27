## ADDED Requirements

### Requirement: Cadastro de obra com câmera e GPS
O sistema SHALL permitir registrar uma obra capturando foto com a câmera do dispositivo e obtendo coordenadas GPS automaticamente.

> **Pré-condição:** permissões de câmera e localização devem estar concedidas. Ver cenários de permissão em [permissions/spec.md](../permissions/spec.md).

#### Scenario: Cadastro completo online
- **WHEN** usuário fotografa uma obra e preenche nome, tipo e estado de conservação
- **THEN** sistema cria ARTWORK no SQLite com UUID, lat/lng, endereço por geocoding reverso e `updated_at` = horário da ação

#### Scenario: Cadastro offline
- **WHEN** usuário cadastra obra sem conexão
- **THEN** sistema salva localmente com `synced_at = null` e sincroniza quando internet estiver disponível

### Requirement: ID único de obra
O sistema SHALL gerar UUID como `id` interno no dispositivo. O `display_id` (ART-YYYY-XXXXX) SHALL ser gerado pelo servidor no primeiro sync.

#### Scenario: Exibição de display_id
- **WHEN** obra é sincronizada com sucesso pela primeira vez
- **THEN** `display_id` recebido do servidor é salvo localmente e exibido na interface

#### Scenario: Exibição antes do primeiro sync
- **WHEN** obra ainda não foi sincronizada
- **THEN** sistema exibe "Pendente" no lugar do display_id

### Requirement: Detecção de obras duplicadas
O sistema SHALL alertar o usuário ao cadastrar uma obra num raio de 30m de outra já existente.

#### Scenario: Obra próxima detectada
- **WHEN** usuário salvar nova obra com coordenadas a menos de 30m de obra existente
- **THEN** sistema exibe alerta "Existe 1 obra próxima. É a mesma?" com opções [Vincular] [Criar nova]
