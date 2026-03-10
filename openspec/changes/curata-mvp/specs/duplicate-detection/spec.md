## ADDED Requirements

### Requirement: Detecção de obras duplicadas via geofence
O sistema SHALL verificar obras existentes num raio de 30m ao cadastrar uma nova obra e alertar o usuário.

#### Scenario: Duplicata detectada
- **WHEN** nova obra é salva com coordenadas a menos de 30m de obra existente não deletada
- **THEN** sistema exibe alerta: "Existe 1 obra próxima. É a mesma?" com ações [Vincular] [Criar nova]

#### Scenario: Nenhuma duplicata
- **WHEN** nova obra é salva sem obras próximas no raio de 30m
- **THEN** sistema salva normalmente sem alertas

### Requirement: Revisão visual de obras próximas
O sistema SHALL exibir lista de obras próximas no formulário de cadastro enquanto o usuário preenche os dados.

#### Scenario: Lista de obras próximas
- **WHEN** coordenadas GPS são obtidas durante cadastro
- **THEN** sistema exibe seção "Obras próximas" com obras num raio de 30m para referência visual
