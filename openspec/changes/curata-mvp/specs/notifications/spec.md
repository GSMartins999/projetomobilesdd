## ADDED Requirements

### Requirement: Notificações de revisita
O sistema SHALL enviar notificações locais lembrando revisita a obras em estado `poor` ou `urgent` que não receberam inspeção após X dias (configurável, padrão 90 dias).

#### Scenario: Notificação agendada
- **WHEN** obra com `conservation_status: poor` ou `urgent` não recebe inspeção por X dias
- **THEN** sistema agenda notificação local via expo-notifications

#### Scenario: Notificação recebida
- **WHEN** usuário toca na notificação
- **THEN** sistema navega diretamente ao detalhe da obra referenciada

### Requirement: Configuração do intervalo de revisita
O sistema SHALL permitir ao usuário configurar o threshold de dias para alerta (padrão: 90 dias).

#### Scenario: Threshold alterado
- **WHEN** usuário altera o valor nas Preferências
- **THEN** sistema reagenda notificações existentes com o novo threshold
