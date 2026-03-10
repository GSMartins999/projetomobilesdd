## ADDED Requirements

### Requirement: Detecção automática de idioma
O sistema SHALL detectar o idioma do dispositivo via expo-localization e aplicar pt-BR, en ou es. Fallback: inglês.

#### Scenario: Idioma suportado detectado
- **WHEN** dispositivo está configurado em português do Brasil
- **THEN** app inicia em pt-BR sem interação do usuário

#### Scenario: Idioma não suportado
- **WHEN** dispositivo está configurado em idioma não suportado (ex: francês)
- **THEN** app inicia em inglês (en)

### Requirement: Troca de idioma manual
O sistema SHALL permitir ao usuário trocar o idioma nas Preferências sem reiniciar o app.

#### Scenario: Troca de idioma
- **WHEN** usuário seleciona novo idioma nas Preferências
- **THEN** toda a interface atualiza imediatamente para o novo idioma

### Requirement: Enum internacionalizado
Valores de enum (`conservation_status`, `type`, `label`) SHALL ser armazenados em inglês no banco e traduzidos na UI via i18n.

#### Scenario: Exibição de estado em PT-BR
- **WHEN** obra com `conservation_status = urgent` é exibida com idioma pt-BR
- **THEN** UI exibe "Urgente" (não "urgent")
