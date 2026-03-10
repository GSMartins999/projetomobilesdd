## ADDED Requirements

### Requirement: Geração de relatório PDF técnico
O sistema SHALL gerar relatório PDF técnico com estado estrutural, agentes de deterioração, urgência, recomendação, fotos etiquetadas, nome da profissional e data.

#### Scenario: Geração bem-sucedida
- **WHEN** usuário seleciona uma inspeção e solicita relatório técnico
- **THEN** sistema gera PDF com todos os dados da inspeção e exibe preview

### Requirement: Geração de relatório PDF simplificado
O sistema SHALL gerar relatório simplificado com nome da obra, localização, foto principal, estado em linguagem acessível, ação recomendada e nome da profissional.

#### Scenario: Geração bem-sucedida
- **WHEN** usuário solicita relatório simplificado de uma inspeção
- **THEN** sistema gera PDF em linguagem acessível sem jargão técnico

### Requirement: Compartilhamento de PDF
O sistema SHALL permitir compartilhar o PDF gerado via share sheet nativa do sistema operacional.

#### Scenario: Compartilhamento
- **WHEN** usuário toca em "Compartilhar" no preview do PDF
- **THEN** sistema abre share sheet nativa com o arquivo PDF anexado
