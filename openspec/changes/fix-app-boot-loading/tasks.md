## 1. Fix: Repositórios estáveis em App.tsx [infrastructure]

- [x] 1.1 [TEST] Escrever teste de renderização de `App` que verifica que a instância do `authRepository` passada ao `DIProvider` é a mesma após múltiplos re-renders (usando `jest.spyOn` ou referência capturada via context)
- [x] 1.2 Refatorar `App.tsx` para criar todas as instâncias de repositório e serviços com `useRef`, garantindo que sejam criadas uma única vez na montagem do componente
- [x] 1.3 Verificar manualmente que após login com o mock, um re-render não reseta a sessão (fazer login, acionar alguma mudança de estado, confirmar que ainda está logado)

## 2. Fix: Feedback visual no AppNavigator [infrastructure]

- [x] 2.1 [TEST] Escrever teste RNTL para `AppNavigator` que confirma que um `ActivityIndicator` é renderizado enquanto `isLoading === true` no `AuthContext`
- [x] 2.2 Substituir `return null` em `AppNavigator.tsx` por um componente de loading (`ActivityIndicator` + `View` centralizada) estilizado de forma consistente com o design do app (`#2A4D69`)
- [x] 2.3 Verificar que após o `AuthContext` resolver, a tela correta aparece sem flash de tela em branco

## 3. Fix: Guarda de sync com URL placeholder [infrastructure]

- [x] 3.1 [TEST] Escrever teste de unidade para `SyncContext` que confirma que `triggerSync` retorna sem chamar `syncService.sync()` quando `EXPO_PUBLIC_SUPABASE_URL` contém `placeholder`
- [x] 3.2 Adicionar guarda em `SyncContext.tsx` no início de `triggerSync` que verifica se a URL do Supabase é a de placeholder; se sim, logar `[SyncContext] Supabase não configurado — sync ignorado.` e retornar sem executar
- [x] 3.3 Confirmar nos logs do Metro que não aparecem mais erros de rede ao iniciar o app sem `.env` configurado

## 4. Validação E2E do fluxo de boot [qa]

- [x] 4.1 Executar o app no simulador/dispositivo e confirmar que: (1) a tela de loading aparece imediatamente ao abrir; (2) a tela de Login aparece após o boot; (3) é possível fazer login com qualquer e-mail/senha; (4) a tela principal (Mapa) é exibida após login
- [x] 4.2 Confirmar que o fluxo de boot funciona tanto com quanto sem variáveis de ambiente configuradas no `.env`
