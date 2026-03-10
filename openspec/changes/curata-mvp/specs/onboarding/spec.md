## ADDED Requirements

### Requirement: Onboarding na primeira execução
O sistema SHALL exibir fluxo de onboarding na primeira vez que o app é executado após login, cobrindo propósito do app e solicitação de permissões.

#### Scenario: Primeira execução
- **WHEN** usuário faz login pela primeira vez
- **THEN** sistema exibe onboarding com 4 slides: propósito, permissão câmera, permissão localização, tutorial rápido

#### Scenario: Permissão concedida
- **WHEN** usuário concede permissão de câmera ou localização
- **THEN** sistema prossegue para o próximo slide do onboarding

#### Scenario: Permissão negada
- **WHEN** usuário nega permissão de câmera ou localização
- **THEN** sistema informa que a funcionalidade ficará limitada e prossegue

### Requirement: Não repetir onboarding
O sistema SHALL exibir o onboarding apenas uma vez. Reabertura do app SHALL ir direto para a tela principal.

#### Scenario: Reabertura após onboarding
- **WHEN** usuário já completou onboarding e reabre o app
- **THEN** sistema pula o onboarding e vai para a aba Mapa
