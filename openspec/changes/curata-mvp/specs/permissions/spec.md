## ADDED Requirements

### Requirement: Solicitação de permissão de câmera

O sistema SHALL solicitar permissão de câmera ao usuário durante o onboarding (slide 2) e novamente ao tentar usar a câmera caso a permissão ainda não tenha sido concedida.

#### Scenario: Permissão de câmera concedida no onboarding
- **DADO** que o usuário está no slide de permissão câmera do onboarding
- **QUANDO** o usuário concede a permissão ao sistema operacional
- **ENTÃO** o sistema registra `camera_permission = granted` no AsyncStorage e avança para o próximo slide

#### Scenario: Permissão de câmera negada no onboarding
- **DADO** que o usuário está no slide de permissão câmera do onboarding
- **QUANDO** o usuário nega a permissão ao sistema operacional
- **ENTÃO** o sistema exibe mensagem "Sem acesso à câmera, você não poderá fotografar obras. Você pode habilitar depois em Configurações." e avança para o próximo slide sem bloquear o fluxo

#### Scenario: Permissão de câmera negada permanentemente (iOS/Android)
- **DADO** que o usuário negou a permissão de câmera mais de uma vez e o sistema operacional bloqueou novas solicitações nativas
- **QUANDO** o usuário tenta fotografar uma obra
- **ENTÃO** o sistema exibe modal com mensagem "Câmera bloqueada. Habilite o acesso em Ajustes > Curata > Câmera." e botão [Abrir Configurações] que chama `Linking.openSettings()`, além de botão [Cancelar]

#### Scenario: Câmera indisponível por erro de hardware
- **DADO** que a permissão de câmera está concedida
- **QUANDO** o sistema tenta abrir a câmera e o hardware retorna erro
- **ENTÃO** o sistema registra o erro em log, exibe "Não foi possível acessar a câmera. Tente novamente." e oferece opção de selecionar foto da galeria como alternativa

#### Scenario: Usuário tenta cadastrar obra sem permissão de câmera
- **DADO** que `camera_permission ≠ granted`
- **QUANDO** o usuário toca no botão de cadastro de obra
- **ENTÃO** o sistema exibe banner de aviso "Câmera indisponível" e desabilita o campo de foto, permitindo preencher os demais campos (nome, tipo, estado de conservação) e salvar a obra sem foto

---

### Requirement: Solicitação de permissão de localização (GPS)

O sistema SHALL solicitar permissão de localização durante o onboarding (slide 3) e ao tentar obter coordenadas GPS caso a permissão ainda não tenha sido concedida.

#### Scenario: Permissão de localização concedida no onboarding
- **DADO** que o usuário está no slide de permissão localização do onboarding
- **QUANDO** o usuário concede a permissão ao sistema operacional
- **ENTÃO** o sistema registra `location_permission = granted` no AsyncStorage e avança para o próximo slide

#### Scenario: Permissão de localização negada no onboarding
- **DADO** que o usuário está no slide de permissão localização do onboarding
- **QUANDO** o usuário nega a permissão ao sistema operacional
- **ENTÃO** o sistema exibe mensagem "Sem acesso à localização, as coordenadas das obras não serão capturadas automaticamente. Você pode habilitar depois em Configurações." e avança para o próximo slide sem bloquear o fluxo

#### Scenario: Permissão de localização negada permanentemente (iOS/Android)
- **DADO** que o usuário negou a permissão de localização mais de uma vez e o sistema operacional bloqueou novas solicitações nativas
- **QUANDO** o usuário tenta cadastrar uma obra ou abrir o mapa
- **ENTÃO** o sistema exibe modal com mensagem "Localização bloqueada. Habilite o acesso em Ajustes > Curata > Localização." e botão [Abrir Configurações] que chama `Linking.openSettings()`, além de botão [Cancelar]

#### Scenario: GPS indisponível ou timeout ao obter coordenadas
- **DADO** que a permissão de localização está concedida
- **QUANDO** o sistema tenta obter coordenadas e o GPS não responde em 10 segundos
- **ENTÃO** o sistema exibe "Não foi possível obter sua localização. Verifique se o GPS está ativo." e permite ao usuário inserir coordenadas manualmente (campos `lat` e `lng`) ou salvar a obra sem coordenadas com `lat = null`, `lng = null`

#### Scenario: Usuário tenta cadastrar obra sem permissão de localização
- **DADO** que `location_permission ≠ granted`
- **QUANDO** o usuário toca no botão de cadastro de obra
- **ENTÃO** o sistema exibe banner de aviso "Localização indisponível – coordenadas não serão capturadas" e permite preencher e salvar a obra com `lat = null`, `lng = null`

#### Scenario: Mapa aberto sem permissão de localização
- **DADO** que `location_permission ≠ granted`
- **QUANDO** o usuário abre a aba Mapa
- **ENTÃO** o sistema exibe o mapa centralizado na última posição conhecida (ou posição padrão da cidade) sem ponto GPS do usuário, e exibe chip "Localização desativada" com ícone de aviso

---

### Requirement: Re-solicitação tardia de permissões

O sistema SHALL oferecer ao usuário a possibilidade de conceder permissões após o onboarding, por meio da tela de Configurações do app.

#### Scenario: Usuário habilita permissão nas Configurações do app
- **DADO** que o usuário negou câmera ou localização no onboarding
- **QUANDO** o usuário acessa Configurações > Permissões e toca em [Habilitar Câmera] ou [Habilitar Localização]
- **ENTÃO** o sistema chama a API nativa de permissão; se concedida, atualiza `camera_permission` ou `location_permission` no AsyncStorage e exibe confirmação "Permissão concedida com sucesso"

#### Scenario: Re-solicitação bloqueada pelo SO
- **DADO** que o SO bloqueou re-solicitações nativas da permissão
- **QUANDO** o usuário toca em [Habilitar Câmera] ou [Habilitar Localização] nas Configurações do app
- **ENTÃO** o sistema exibe modal direcionando para as Configurações do sistem operacional via `Linking.openSettings()`
