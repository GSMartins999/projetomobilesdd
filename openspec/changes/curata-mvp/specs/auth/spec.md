## ADDED Requirements

### Requirement: Login com email e senha via Supabase
O sistema SHALL permitir login com email e senha usando Supabase Auth.

#### Scenario: Login bem-sucedido
- **WHEN** usuário insere email e senha válidos e está online
- **THEN** sistema obtém JWT, armazena em expo-secure-store e navega para a tela principal

#### Scenario: Login offline com token existente
- **WHEN** usuário abre o app sem internet mas com JWT válido em expo-secure-store
- **THEN** sistema autentica localmente e permite acesso ao app sem requisição de rede

#### Scenario: Token expirado offline
- **WHEN** JWT está expirado e não há internet disponível
- **THEN** sistema SHALL exibir tela de login e informar que conexão é necessária para renovar sessão

### Requirement: Refresh automático de token
O sistema SHALL renovar o JWT automaticamente via Supabase SDK quando online e o token estiver próximo do vencimento.

#### Scenario: Refresh automático bem-sucedido
- **WHEN** app está online e token expira
- **THEN** Supabase SDK renova token sem interação do usuário

### Requirement: Logout
O sistema SHALL permitir logout limpando o JWT do expo-secure-store.

#### Scenario: Logout bem-sucedido
- **WHEN** usuário confirma logout
- **THEN** sistema remove JWT do expo-secure-store e navega para tela de login
