# Tasks: Fix Architecture Flaws

- [x] Refatorar `ArtworkFormScreen.tsx` e `InspectionFormScreen.tsx` usando `useMemo` na inicialização de UseCases.
- [x] Atualizar código de salvamento para mover arquivos de mídia (`photos`) do `cacheDirectory` para o `documentDirectory` com o `expo-file-system`.
- [x] Modificar `CreateArtworkUseCase.ts` para verificar `forceCreate` e lançar um Erro em caso de duplicatas ocultas.
- [x] Modificar `ArtworkFormScreen.tsx` para tratar a confirmação (force) após a detecção de erro.
- [x] Substituir modelo do banco em `client.ts` para rodar migrações baseadas no `PRAGMA user_version`.
- [x] Refatorar manipulação de hora no `SyncServiceImpl.ts` para utilizar o timestamp mais alto do lado servidor.
