## 1. Camada de Dados & Sincronização (Data Layer)

- [ ] 1.1 Corrigir string literal de status de upload de fotos no método `uploadPendingPhotos` da classe `SyncServiceImpl.ts`, alterando de `'synced'` para `'done'` [data]
- [ ] 1.2 Ajustar a chamada reflexiva para buscar fotos pendentes na classe `SyncServiceImpl.ts` alterando para invocar `findUnsyncedPhotos()` em vez de `findUnsynced()`, ou adicionar o alias correspondente no `PhotoRepositoryImpl.ts` [data]
- [ ] 1.3 Refatorar os métodos `save` nas classes `ArtworkRepositoryImpl.ts`, `InspectionRepositoryImpl.ts` e `PhotoRepositoryImpl.ts` para verificar a existência do registro por `id` localmente antes de persistir, aplicando `.onConflictDoUpdate()` ou fallback para `update` a fim de evitar violação de chave primária no download (LWW) [data]
- [ ] 1.4 Adicionar mapeamento explícito de chaves no recebimento de objetos remotos via Supabase (ex: traduzir `display_id` para `displayId`, `updated_at` para `updatedAt`, `conservation_status` para `conservationStatus`) nos métodos de persistência LWW [data]
- [ ] 1.5 Corrigir o filtro na query `findUnsynced()` do arquivo `InspectionRepositoryImpl.ts` substituindo a comparação de igualdade estática por `isNull(inspections.syncedAt)` [data]
- [ ] 1.6 Atualizar os métodos `softDelete` nos repositórios para preencher explicitamente `syncedAt = null` a fim de garantir propagação offline da deleção [data]

## 2. Camada de Domínio (Domain Layer)

- [ ] 2.1 Estender a interface `CreateArtworkInput` no arquivo `Artwork.ts` para prever a propriedade opcional `photoLocalPath?: string` [domain]
- [ ] 2.2 Atualizar o caso de uso `CreateArtworkUseCase.ts` para injetar o `PhotoRepository` e salvar o registro da foto inicial vinculada à nova obra caso `photoLocalPath` seja provido [domain]
- [ ] 2.3 Refatorar a folha de estilo embutida na string HTML da classe `GenerateReportUseCase.ts` corrigindo a sintaxe camelCase `.status-badge { borderRadius: 20px; }` para notação CSS nativa `border-radius: 20px;` [domain]
- [ ] 2.4 Alinhar o método de compilação do relatório em `GenerateReportUseCase.ts` para consumir exclusivamente o conversor de HTML para PDF fornecido pela biblioteca `react-native-html-to-pdf` (substituindo chamadas legadas ao `expo-print`) [domain]

## 3. Infraestrutura & UI (Infrastructure & Presentation Layer)

- [ ] 3.1 Substituir inteiramente a importação de `react-native-maps` na tela `MapScreen.tsx` pelo módulo oficial `@maplibre/maplibre-react-native`, adotando os componentes nativos `MapView` e `PointAnnotation` para renderização [presentation]
- [ ] 3.2 Implementar o layout visual do marcador na tela `MapScreen.tsx` utilizando as anotações do MapLibre sem perdas na paleta de identificação existente [presentation]
- [ ] 3.3 Adicionar importações ausentes das interfaces `ArtworkRepository`, `InspectionRepository` e `PhotoRepository` no cabeçalho do arquivo de configuração de injeção de dependências `DIContext.tsx` [infrastructure]
- [ ] 3.4 Corrigir o fechamento de variáveis no escopo de montagem do listener `NetInfo` no arquivo `SyncContext.tsx` utilizando `useRef` para capturar a referência atualizada do estado de sincronização em tempo real [infrastructure]
- [ ] 3.5 Otimizar as telas `ArtworkFormScreen.tsx` e `InspectionFormScreen.tsx` envolvendo as instâncias dos casos de uso de domínio em hooks `useMemo` para evitar alocações constantes durante as atualizações do formulário [presentation]
