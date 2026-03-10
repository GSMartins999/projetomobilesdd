## ADDED Requirements

### Requirement: Busca textual de obras
O sistema SHALL permitir buscar obras por nome, artista ou endereço com resultados em tempo real.

#### Scenario: Busca com resultado
- **WHEN** usuário digita termo de busca
- **THEN** sistema exibe obras cujo nome, artista ou endereço contém o termo (case-insensitive)

#### Scenario: Busca sem resultado
- **WHEN** nenhuma obra corresponde ao termo
- **THEN** sistema exibe estado vazio com mensagem clara

### Requirement: Filtros de obras
O sistema SHALL permitir filtrar obras por tipo (`type`) e estado de conservação (`conservation_status`), combinados com a busca textual.

#### Scenario: Filtro aplicado
- **WHEN** usuário seleciona filtro por estado "urgent"
- **THEN** lista exibe apenas obras com `conservation_status = urgent`

#### Scenario: Múltiplos filtros
- **WHEN** usuário combina busca textual + filtro de tipo
- **THEN** sistema aplica ambos os critérios com operador AND
