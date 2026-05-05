## MODIFIED Requirements

### Requirement: Repositórios estáveis entre re-renders
O sistema SHALL garantir que as instâncias dos repositórios passadas ao `DIProvider` sejam criadas exatamente uma vez durante o ciclo de vida do componente `App`, preservando qualquer estado interno em memória (ex: sessão do mock de auth) entre re-renders.

#### Scenario: App re-renderiza após mudança de estado
- **WHEN** o componente `App` re-renderiza por qualquer mudança de estado (ex: `isReady` muda de `false` para `true`)
- **THEN** as instâncias dos repositórios no `DIProvider` SHALL ser as mesmas referências (mesmo objeto) de antes do re-render

#### Scenario: Auth mock mantém sessão após re-render
- **WHEN** o usuário faz login via `MockAuthRepositoryImpl` e o componente re-renderiza
- **THEN** `authRepository.getCurrentUser()` SHALL retornar o mesmo usuário logado, sem resetar a sessão

### Requirement: Feedback visual durante loading do AuthContext
O sistema SHALL exibir um indicador visual de carregamento enquanto o `AppNavigator` aguarda a resolução do estado de autenticação (`isLoading === true`), em vez de renderizar `null`.

#### Scenario: AuthContext resolvendo sessão inicial
- **WHEN** o `AppNavigator` é montado e `isLoading` do `AuthContext` é `true`
- **THEN** o componente SHALL renderizar um `ActivityIndicator` centralizado na tela

#### Scenario: AuthContext resolve sessão
- **WHEN** `isLoading` muda para `false`
- **THEN** o `AppNavigator` SHALL exibir a tela correta (Login ou Main) sem flash de tela em branco

### Requirement: Sync automático inibido com credenciais placeholder
O sistema SHALL não iniciar sincronização com o Supabase quando a URL configurada for a URL de placeholder (`https://placeholder.supabase.co`), evitando erros de rede silenciosos durante o desenvolvimento.

#### Scenario: Detecção de conexão com URL placeholder
- **WHEN** o `SyncContext` detecta que o dispositivo ficou online
- **AND** `EXPO_PUBLIC_SUPABASE_URL` contém `placeholder`
- **THEN** o sync automático SHALL ser abortado sem gerar erros no console

#### Scenario: Detecção de conexão com URL real
- **WHEN** o `SyncContext` detecta que o dispositivo ficou online
- **AND** `EXPO_PUBLIC_SUPABASE_URL` é uma URL válida (não placeholder)
- **THEN** o sync automático SHALL ser disparado normalmente
