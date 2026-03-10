## ADDED Requirements

### Requirement: Formulário técnico de inspeção
O sistema SHALL permitir criar uma inspeção com formulário técnico estruturado validado por Zod, incluindo estado estrutural, estado superficial, agentes de deterioração, urgência [1–5] e recomendação técnica.

#### Scenario: Inspeção criada com sucesso
- **WHEN** usuário preenche os campos obrigatórios e salva
- **THEN** sistema cria registro INSPECTION em SQLite vinculado ao ARTWORK com `updated_at` = horário da ação

#### Scenario: Formulário inválido
- **WHEN** usuário tenta salvar sem preencher campos obrigatórios
- **THEN** sistema exibe erros de validação inline sem fechar o formulário

### Requirement: Fotos etiquetadas por inspeção
O sistema SHALL permitir adicionar fotos à inspeção com etiquetas (front | detail | context) em ordem definida pelo usuário.

#### Scenario: Adição de foto
- **WHEN** usuário captura foto e seleciona etiqueta
- **THEN** sistema salva arquivo comprimido (max 1200px / 300KB) em expo-file-system e cria registro PHOTO com `upload_status: pending`

#### Scenario: Limite de fotos
- **WHEN** inspeção já possui 10 fotos
- **THEN** sistema SHALL impedir adição de novas fotos e informar o limite atingido

### Requirement: Histórico de inspeções por obra
O sistema SHALL exibir todas as inspeções de uma obra em ordem cronológica decrescente.

#### Scenario: Visualização do histórico
- **WHEN** usuário acessa o detalhe de uma obra
- **THEN** sistema exibe lista de inspeções com data, estado na visita e thumbnail da primeira foto
