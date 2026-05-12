## Why

A auditoria técnica da base de código do aplicativo **Curata** (MVP) revelou débitos técnicos críticos e inconsistências arquiteturais que ameaçam o pilar central do produto: a resiliência operacional em modo **offline-first**.

Atualmente, o mecanismo de sincronização possui falhas graves (status de upload inválido, chamadas a métodos com nomes incorretos que causam *crash* imediato e colisões silenciosas/fatais de chave primária no banco local devido ao uso direto de `insert`). Além disso, a aplicação viola regras expressas do escopo e arquitetura definidos: renderiza telas com `react-native-maps` em vez de utilizar renderização nativa de tiles offline com `react-native-maplibre`, e utiliza bibliotecas divergentes para a geração de relatórios PDF. Por fim, as fotos tiradas durante o fluxo de cadastro de uma nova obra são silenciosamente descartadas pelo caso de uso correspondente, resultando em perda de dados do usuário em campo.

## What Changes

Correção e alinhamento sistemático da base de código do Curata MVP para estabilizar o sincronismo offline e honrar os contratos de arquitetura:

- **Correção**: Alteração do status salvo após o upload de fotos no `SyncServiceImpl` de `'synced'` para `'done'`, respeitando estritamente o schema SQLite e as entidades do domínio.
- **Correção**: Renomeação/ajuste da chamada de busca de fotos não sincronizadas no serviço de sync de `findUnsynced()` para `findUnsyncedPhotos()` para mitigar *crashes* em tempo de execução.
- **Correção**: Implementação de resiliência a Primary Key Constraints nos métodos `save` dos repositórios locais (`ArtworkRepositoryImpl`, `InspectionRepositoryImpl`, `PhotoRepositoryImpl`), substituindo `insert` direto por checagem ou `.onConflictDoUpdate()` e mapeando colunas de `snake_case` do backend para `camelCase` local.
- **Correção**: Ajuste das queries SQL no `InspectionRepositoryImpl` para utilizar o operador `isNull(syncedAt)` no Drizzle, garantindo a seleção correta de registros pendentes.
- **Correção**: Re-sincronização de *soft deletes* locais redefinindo `syncedAt` para `null` ao deletar offline.
- **Refatoração**: Substituição completa da biblioteca `react-native-maps` na tela `MapScreen.tsx` pela implementação oficial em `@maplibre/maplibre-react-native` com fontes nativas offline.
- **Refatoração**: Alinhamento do gerador de PDF (`GenerateReportUseCase.ts`) para utilizar a biblioteca configurada `react-native-html-to-pdf` em vez de `expo-print`.
- **Refatoração**: Correção de propriedades CSS (*borderRadius* para *border-radius*) no relatório técnico HTML.
- **Nova Feature**: Implementação da persistência de fotos iniciais capturadas na tela `ArtworkFormScreen.tsx` passando a imagem e delegando o registro à camada de dados correspondente.
- **Otimização**: Estabilização dos *renders* das telas de formulário com o uso de `useMemo` ou `useRef` para os casos de uso injetados, prevenindo realocações excessivas na memória.

## Capabilities

### Modified Capabilities

- `offline-sync`: Correção das rotinas de upload de fotos, download em *Last-Write-Wins* sem violação de chave primária e mapeamento adequado de snake_case para camelCase.
- `map-view`: Renderização nativa offline utilizando `react-native-maplibre` e remoção total de dependências do `react-native-maps`.
- `artwork-registration`: Suporte completo ao salvamento de fotos iniciais capturadas em campo e persistência de endereços.
- `pdf-report`: Padronização do motor de renderização via `react-native-html-to-pdf` com CSS devidamente validado.

## Impact

- **Dependências principais**: Remoção da biblioteca `react-native-maps` e consolidação de `@maplibre/maplibre-react-native` e `react-native-html-to-pdf`.
- **Banco de Dados Local**: Estabilização do Drizzle ORM sobre o `expo-sqlite` sem alteração de estrutura de tabelas, apenas ajustes lógicos nas queries e conflitos.
