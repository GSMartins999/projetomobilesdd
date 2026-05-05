## Why

O app do Curata fica preso na tela de carregamento e nunca exibe nenhuma tela ao usuário. O problema é causado por três bugs estruturais no fluxo de boot: instâncias de repositórios recriadas a cada render (destruindo o estado em memória do mock de auth), tela em branco retornada durante o loading do `AuthContext`, e o `SyncContext` disparando sync com credenciais placeholder ao detectar internet. Esses bugs bloqueiam completamente o uso do MVP.

## What Changes

- **Fix**: `App.tsx` — repositórios instanciados com `useRef` em vez de serem criados diretamente no corpo do render, evitando perda de estado entre re-renders
- **Fix**: `AppNavigator.tsx` — substituir `return null` durante `isLoading` por um `ActivityIndicator` centralizado com feedback visual para o usuário
- **Fix**: `SyncContext.tsx` — adicionar guarda para não disparar sync automático quando as credenciais do Supabase são as de placeholder (dev), evitando erros silenciosos
- **Melhoria**: `App.tsx` — remover instanciação dos repositórios fora do ciclo de vida do componente (sem `useEffect`, mas usando `useRef` estável)

## Capabilities

### New Capabilities

*(Nenhuma — apenas correções de bugs estruturais)*

### Modified Capabilities

- `app-boot`: O fluxo de inicialização do app precisa garantir que: (1) repositórios sejam instâncias estáveis entre renders; (2) o loading do AuthContext exiba feedback visual; (3) o sync automático não execute com credenciais inválidas

## Impact

- **`curata-app/src/App.tsx`**: Refatoração do corpo do componente para usar `useRef` nos repositórios
- **`curata-app/src/infrastructure/navigation/AppNavigator.tsx`**: Substituição do `return null` por um indicador visual de loading
- **`curata-app/src/infrastructure/sync/SyncContext.tsx`**: Adição de guarda contra sync com URL placeholder
- **Sem impacto em testes de unidade existentes** — as interfaces dos repositórios não mudam
- **Non-goals**: Não inclui migração para Supabase Auth real, não refatora o sistema de DI, não altera a arquitetura de sync
