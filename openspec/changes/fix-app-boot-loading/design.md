## Context

O `App.tsx` atualmente instancia todos os repositórios diretamente no corpo do componente (fora de qualquer hook), o que significa que **uma nova instância é criada a cada re-render**. O `MockAuthRepositoryImpl` guarda a sessão do usuário em memória (`this.currentUser`), portanto quando uma nova instância é criada após um re-render, a sessão é perdida e o `AuthContext` detecta o usuário como deslogado, causando um loop silencioso.

O `AppNavigator.tsx` retorna `null` enquanto o `AuthContext` resolve a sessão (`isLoading = true`), resultando em tela completamente em branco — sem feedback algum para o usuário.

O `SyncContext.tsx` dispara sync automático ao detectar conectividade, mas o `supabaseClient.ts` usa a URL `https://placeholder.supabase.co` quando não há variáveis de ambiente configuradas. Isso gera uma requisição HTTP que falha silenciosamente a cada conexão detectada durante o desenvolvimento.

## Goals / Non-Goals

**Goals:**
- Repositórios instanciados uma única vez por ciclo de vida do componente `App`
- Tela de loading visível e com feedback durante a inicialização do `AuthContext`
- Sync automático do `SyncContext` inibido quando a URL do Supabase for a de placeholder

**Non-Goals:**
- Migrar para Supabase Auth real (fica para quando o backend estiver provisionado)
- Refatorar o sistema de DI para usar factories ou um container dedicado
- Alterar a lógica de sincronização em si

## Decisions

### Decisão 1: `useRef` para instanciar repositórios em `App.tsx`

**Escolha**: usar `useRef` para criar as instâncias dos repositórios uma única vez, na montagem do componente.

```tsx
const repos = useRef({
    artworkRepository: new ArtworkRepositoryImpl(db),
    authRepository: new MockAuthRepositoryImpl(),
    inspectionRepository: new InspectionRepositoryImpl(db),
    photoRepository: new PhotoRepositoryImpl(db),
    syncService: new SyncServiceImpl(...),
    cameraService: new CameraServiceImpl(),
}).current;
```

**Alternativas consideradas:**
- `useMemo` com array de deps vazio — funciona igualmente, mas `useRef` é semanticamente mais claro para "valor estável por toda a vida do componente"
- Mover para fora do componente (módulo global) — funciona mas torna o teste mais difícil e acopla a inicialização do DB ao import do módulo
- Factory no `DIProvider` — correta no longo prazo, mas foge do escopo deste fix

**Rationale**: `useRef` garante que a referência nunca muda entre renders. É a solução mínima e reversível.

### Decisão 2: Substituir `return null` por `ActivityIndicator` no `AppNavigator`

**Escolha**: Renderizar um `ActivityIndicator` centralizado enquanto `isLoading === true`, ao invés de `null`.

**Alternativas consideradas:**
- Usar a SplashScreen nativa do Expo (`expo-splash-screen`) — correta para produção, mas adiciona complexidade fora do escopo do bug
- Manter `null` e confiar no splash nativo — não fornece feedback e causa confusão em dev

**Rationale**: Mínimo de código, máximo de clareza para o usuário e para o desenvolvedor em modo dev.

### Decisão 3: Guarda de URL placeholder no `SyncContext`

**Escolha**: Antes de executar o sync, verificar se `EXPO_PUBLIC_SUPABASE_URL` contém `placeholder`. Se sim, logar um aviso e abortar silenciosamente.

**Rationale**: Evita requisições HTTP falhas a cada detecção de rede durante o desenvolvimento, sem alterar a lógica de sync em produção.

## Risks / Trade-offs

- **`useRef` não é reativo** → Como os repositórios não mudam (são sempre as mesmas instâncias), isso é desejado. Se no futuro for necessário trocar implementações em runtime, a arquitetura de DI precisará evoluir.
- **Suprimir sync em dev pode mascarar problemas de rede reais** → A guarda é baseada na URL literal `placeholder`, portanto não afeta nenhuma URL real.
- **`ActivityIndicator` aparecerá brevemente em produção** → Aceitável; em produção a checagem de sessão (Supabase) será rápida e o splash nativo cobrirá a maior parte do tempo.
