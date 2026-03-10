## ADDED Requirements

### Requirement: Mapa de obras com react-native-maplibre
O sistema SHALL exibir todas as obras em mapa usando react-native-maplibre com tiles OpenStreetMap, com marcadores coloridos por estado de conservação.

#### Scenario: Exibição de marcadores
- **WHEN** usuário abre a aba Mapa
- **THEN** sistema exibe marcadores para todas as obras não deletadas, coloridos por `conservation_status`

#### Scenario: Mapa offline
- **WHEN** usuário abre o mapa sem internet e tiles foram baixados previamente
- **THEN** mapa exibe tiles em cache e marcadores das obras locais

#### Scenario: Sem tiles offline e sem internet
- **WHEN** não há tiles em cache nem conexão
- **THEN** sistema exibe mapa em branco com ponto GPS do usuário e marcadores das obras

### Requirement: Download de tiles offline
O sistema SHALL baixar tiles OpenStreetMap automaticamente num raio de 10km a cada 30 minutos quando online, com pausa automática se bateria < 20%.

#### Scenario: Download automático
- **WHEN** app está online e intervalo de 30 minutos passou
- **THEN** sistema baixa tiles do raio de 10km em background sem bloquear UI

#### Scenario: Pausa por bateria baixa
- **WHEN** nível de bateria cai abaixo de 20%
- **THEN** sistema pausa download de tiles até bateria > 20%

### Requirement: Configuração de download de tiles
O sistema SHALL permitir ao usuário configurar o comportamento de download (automático / manual / somente WiFi).

#### Scenario: Configuração aplicada
- **WHEN** usuário seleciona "somente WiFi" nas Preferências
- **THEN** sistema cancela downloads em andamento via dados móveis e retoma apenas quando em WiFi
