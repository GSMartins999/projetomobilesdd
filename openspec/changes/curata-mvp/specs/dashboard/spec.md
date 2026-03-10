## ADDED Requirements

### Requirement: Dashboard de resumo do acervo
O sistema SHALL exibir contagem de obras por estado de conservação e alertas de obras sem visita recente.

#### Scenario: Exibição do dashboard
- **WHEN** usuário abre a aba Dashboard
- **THEN** sistema exibe: total de obras, contagem por estado (good/regular/poor/urgent) e quantidade de obras sem inspeção há mais de X dias

### Requirement: Navegação do dashboard para obras
O sistema SHALL permitir navegar do dashboard diretamente para a lista de obras filtrada por estado.

#### Scenario: Tap em contagem de urgentes
- **WHEN** usuário toca no card "Urgente: X"
- **THEN** sistema navega para a lista de obras com filtro `conservation_status = urgent` pré-aplicado
