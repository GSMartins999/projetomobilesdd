## Context

O app Curata MVP possui lógicas fundacionais estabelecidas sobre Clean Architecture, persistência local em SQLite via Drizzle ORM e injeção de dependências via Context API. A auditoria técnica identificou que a integridade relacional e de persistência do modo offline-first está comprometida por inconsistências de mapeamento, chamadas de métodos incorretas e falta de resiliência a colisões de Primary Key. Adicionalmente, existem violações de stack em apresentação e geração de relatórios.

Este documento formaliza as decisões arquiteturais específicas para resolver esses débitos técnicos, preservando as interfaces e contratos globais.

## Goals / Non-Goals

**Goals:**
- Estabilizar a sincronização de fotos corrigindo strings de status literais no `SyncServiceImpl`.
- Prevenir *crashes* ajustando assinaturas de métodos invocados reflexivamente.
- Implementar tolerância a colisões de Primary Key no Drizzle ORM aplicando `.onConflictDoUpdate()` ou checagens prévias.
- Corrigir a desserialização de colunas vindas em `snake_case` do Supabase para o padrão `camelCase` das entidades locais.
- Garantir que deleções feitas em modo offline (*soft delete*) redefinam a coluna `syncedAt` para `null` a fim de acionar a re-sincronização.
- Substituir completamente a biblioteca `react-native-maps` por `@maplibre/maplibre-react-native` nativo na tela `MapScreen.tsx`.
- Consolidar a stack de geração de relatórios em `react-native-html-to-pdf` com sintaxe CSS estritamente correta.
- Garantir que fotos capturadas na criação de obras sejam salvas no repositório.
- Otimizar o ciclo de vida dos *Use Cases* instanciados no React para evitar re-criação excessiva.

**Non-Goals:**
- Mudar a estratégia global de sincronismo (mantém-se *Last-Write-Wins* por `updated_at`).
- Alterar o esquema de tabelas ou criar novas entidades no banco de dados.

## Decisions

### D1 — Correção de Literais de Status de Upload
No método `uploadPendingPhotos` da classe `SyncServiceImpl`, o status atualizado no repositório local após sucesso no upload do binário para o Storage deve ser estritamente `'done'` (e não `'synced'`), conforme tipado no Drizzle schema e na entidade `Inspection/Photo`.

---

### D2 — Conserto da Assinatura de Busca de Fotos
No loop genérico de sincronização (`syncTable`), a tabela de fotos será tratada com verificação explícita para invocar `findUnsyncedPhotos()` no `PhotoRepositoryImpl`, ou a implementação do repositório de fotos adicionará o alias `findUnsynced()` delegando para a função original para manter compatibilidade de interface com as demais tabelas.

---

### D3 — Tratamento de Colisão de Primary Key no Sincronismo (LWW)
Os repositórios locais (`ArtworkRepositoryImpl`, `InspectionRepositoryImpl`, `PhotoRepositoryImpl`) receberão modificação em seus métodos `save` para não executar `insert` cego. Ao receber um registro baixado do servidor, o repositório deve:
1. Verificar se o registro com aquele `id` já existe localmente.
2. Se não existir, executar o `insert`.
3. Se existir (e a lógica LWW remota for mais recente), executar um `update` mapeando todos os campos apropriadamente.

---

### D4 — Mapeamento Explícito de Chaves de Colunas (snake_case → camelCase)
Ao realizar o download via `supabase.from(table).select('*')`, os dados chegam no formato do PostgreSQL. O serviço de sincronização ou os repositórios deverão mapear explicitamente chaves como `display_id` para `displayId`, `updated_at` para `updatedAt`, `synced_at` para `syncedAt`, `deleted_at` para `deletedAt` e `conservation_status` para `conservationStatus` antes da persistência local.

---

### D5 — Re-sincronização de Soft Delete Offline
Os métodos `softDelete` nos repositórios serão atualizados para atribuir `syncedAt = null` além de preencher o timestamp atual em `deletedAt` e `updatedAt`. Isso assegura que a deleção local seja capturada na próxima chamada a `findUnsynced()` e propagada para o backend.

---

### D6 — Stack de Mapas e PDF em Conformidade
- A tela `MapScreen.tsx` será refatorada para utilizar os componentes `MapView` e `PointAnnotation` exportados por `@maplibre/maplibre-react-native`, cumprindo o pilar de renderização offline nativa sem WebView.
- O `GenerateReportUseCase.ts` adotará a chamada nativa de `RNHTMLtoPDF.convert` para compor o arquivo final, expurgando o uso de `expo-print` e aplicando as regras CSS corretas (ex: `border-radius: 20px;`).

---

### D7 — Persistência de Fotos no Cadastro Inicial de Obras
A interface `CreateArtworkInput` e o caso de uso `CreateArtworkUseCase` serão estendidos para aceitar opcionalmente o parâmetro `photoLocalPath`. Caso presente, o caso de uso coordenará com o `PhotoRepository` a criação de um registro inicial de foto vinculada à obra-mãe, com status de upload pendente.

---

### D8 — Otimização de Referências de Componentes React
Nas telas `ArtworkFormScreen` e `InspectionFormScreen`, a instanciação dos casos de uso de domínio e serviços será envolvida no hook `useMemo` ou inicializada de forma estável para que as instâncias persistam entre os ciclos normais de renderização do formulário.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Substituição de biblioteca de mapas exigir reescrita de marcadores customizados | Preservar a paleta de cores estática existente e portar o layout do pin via `PointAnnotation` do MapLibre |
| Mapeamento de propriedades aumentar verbosidade no repositório | Centralizar o conversor de chaves em um utilitário simples de serialização de entidades |
