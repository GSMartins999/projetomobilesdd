## ADDED Requirements

### Requirement: Onboarding na primeira execução
O sistema SHALL exibir fluxo de onboarding na primeira vez que o app é executado após login, cobrindo propósito do app e solicitação de permissões.

#### Scenario: Primeira execução
- **WHEN** usuário faz login pela primeira vez
- **THEN** sistema exibe onboarding com 4 slides: propósito, permissão câmera, permissão localização, tutorial rápido

#### Scenario: Permissão concedida
- **DADO** que o usuário está no slide de permissão de câmera ou localização
- **QUANDO** o usuário concede a permissão ao sistema operacional
- **ENTÃO** sistema prossegue para o próximo slide do onboarding

#### Scenario: Permissão negada
- **DADO** que o usuário está no slide de permissão de câmera ou localização
- **QUANDO** o usuário nega a permissão ao sistema operacional
- **ENTÃO** sistema informa que a funcionalidade ficará limitada e prossegue sem bloquear o fluxo

> **Ver cenários detalhados de erro:** [permissions/spec.md](../permissions/spec.md)

### Requirement: Não repetir onboarding
O sistema SHALL exibir o onboarding apenas uma vez. Reabertura do app SHALL ir direto para a tela principal.

#### Scenario: Reabertura após onboarding
- **WHEN** usuário já completou onboarding e reabre o app
- **THEN** sistema pula o onboarding e vai para a aba Mapa
