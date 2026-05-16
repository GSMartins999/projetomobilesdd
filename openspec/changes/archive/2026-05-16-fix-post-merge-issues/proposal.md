# Proposal: Fix Post-Merge Issues

## Goal
Corrigir todos os problemas introduzidos pelo merge da branch `cce0061` (bounding box duplicate detection, date pickers, expo-notifications) com a branch `HEAD` (MapLibre, monument type, photo upload direto). O merge deixou 18 erros de compilação TypeScript, 3 bugs silenciosos de runtime e testes quebrados.

## Scope

### In Scope
1. **Schema/Entity Mismatch:** Adicionar o tipo `'monument'` ao schema Drizzle da tabela `artworks`, alinhando com a entidade `Artwork`.
2. **Photo.inspectionId Nullable:** Tornar `inspectionId` nullable na entidade `Photo` e no schema Drizzle, permitindo fotos vinculadas diretamente a obras sem inspeção.
3. **handleSave Type Bug:** Corrigir a assinatura de `onPress` em `ArtworkFormScreen` que acidentalmente desabilita a detecção de duplicatas ao passar `GestureResponderEvent` como `forceCreate`.
4. **DashboardScreen.createdAt:** Substituir referências a `createdAt` (inexistente) por `updatedAt` na entidade `Inspection`.
5. **expo-file-system API Migration:** Atualizar chamadas deprecadas de `FileSystem.EncodingType` e `FileSystem.documentDirectory` para a API do SDK 54.
6. **Test Mock Drift:** Atualizar mocks de `InspectionRepository`, `PhotoRepository` e corrigir imports errados em `LogoutUseCase.test.ts` e `AuthContext.test.tsx`.

### Out of Scope
- Refatoração da navegação da câmera (já corrigida com `DeviceEventEmitter` nesta sessão).
- Migração do MapLibre para react-native-maps (já feita nesta sessão).
- Implementação de novas funcionalidades.
- Otimizações de performance ou UX.
