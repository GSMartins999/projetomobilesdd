## Context

Durante a validação em campo do MVP do Curata, os usuários apontaram alguns comportamentos inconsistentes em fluxos principais:
1. **Erro de Redirecionamento no Mapa**: Ao clicar no balão (popup) de detalhes de uma obra e selecionar o botão para visualizar a obra, o aplicativo abre incorretamente a tela de criação de nova obra (`ArtworkFormScreen`) em vez de abrir a tela de visualização detalhada (`ArtworkDetailScreen`).
2. **Geração de Relatórios sem Fotos e Formatos Incompletos**: As fotos das inspeções não são exibidas nos relatórios PDF gerados, pois os caminhos de arquivo absolutos não são interpretados corretamente pelo `expo-print` no Android sem o esquema `file://`. Além disso, os botões de formatos como CSV/Excel não exportam dados válidos.
3. **Erros de Autenticação pouco Amigáveis**: Mensagens de erro de infraestrutura do Supabase (como "Email rate limit exceeded" ou "Email already exists") são exibidas em inglês bruto diretamente para o usuário, prejudicando a UX.
4. **Localização e Destaque no Perfil**: O aplicativo inicializa em inglês e as pílulas de seleção de idioma no `ProfileScreen` não refletem visualmente qual idioma está ativo.

---

## Goals / Non-Goals

**Goals:**
- Corrigir a navegação do popup do mapa no `MapScreen` para abrir a tela `ArtworkDetail` com o respectivo ID.
- Atualizar o `GenerateReportUseCase` e o `ReportGeneratorScreen` para renderizar as fotos das obras/inspeções (utilizando esquemas `file://` no Android e URLs do Supabase em caso de sincronização), bem como implementar a exportação estruturada em CSV para as opções de planilhas.
- Implementar um utilitário de tratamento de erros no módulo de infraestrutura de autenticação para traduzir mensagens de erro do Supabase.
- Configurar o idioma padrão de inicialização para `pt-BR` e ajustar as cores de seleção de idioma no perfil.
- Resolver a inconsistência do ID de dispositivo fixo (`device-1`) no `InspectionFormScreen` conectando-o ao hook `useAuth`.

**Non-Goals:**
- Criação de uma interface para download de múltiplos relatórios em lote.
- Tradução de campos de texto livre preenchidos pelo usuário.
- Utilização de bibliotecas pesadas de terceiros fora do Expo para geração nativa de arquivos `.xlsx` (será utilizado formato CSV/TSV simplificado com compatibilidade universal).

---

## Decisions

### 1. Correção de Roteamento no Mapa (MapScreen.tsx)
- **Escolha**: Mudar a ação do botão CTA de `navigation.navigate('ArtworkForm')` para `navigation.navigate('ArtworkDetail', { id: selected.id })`.
- **Justificativa**: Garante que o usuário navegue para os detalhes da obra selecionada, que é o comportamento esperado.

### 2. Tratamento de Mídias e Geração de Relatórios (GenerateReportUseCase.ts e ReportGeneratorScreen.tsx)
- **Escolha**:
  - Utilizar a classe utilitária `ImageUtils.getImageUri` no gerador de HTML do PDF para prefixar caminhos locais com `file://` e suportar URLs de imagens remotas (`https://...`) quando disponíveis.
  - Implementar uma lógica de exportação em CSV no `ReportGeneratorScreen` para salvar e compartilhar arquivos de dados tabulares (CSV/Excel) estruturados a partir das inspeções de forma nativa e universal.
- **Justificativa**: Evita a inclusão de dependências pesadas e resolve o problema de renderização de caminhos absolutos no sandbox do WebView de impressão do Android.

### 3. Utilitário de Tradução de Erros de Auth (AuthErrorHelper.ts)
- **Escolha**: Criar um arquivo helper na camada de infraestrutura (`src/infrastructure/auth/AuthErrorHelper.ts`) que analisa o erro retornado pelo Supabase (mensagens e códigos) e mapeia para traduções amigáveis via `i18next`.
- **Justificativa**: Mantém a separação de conceitos de Clean Architecture, deixando a camada de apresentação livre de regras de parser de strings de erros.

### 4. Ajustes de i18n e UI do Perfil (i18n/index.ts e ProfileScreen.tsx)
- **Escolha**:
  - Ajustar o fallback e linguagem inicial do `i18next` para `pt-BR`.
  - Vincular o estado visual das pílulas de idioma no `ProfileScreen` diretamente ao valor do `i18n.language` ativo.
- **Justificativa**: Alinha a identidade visual e linguística do MVP com o mercado brasileiro (público principal de v1).

### 5. Consistência de Device ID (InspectionFormScreen.tsx)
- **Escolha**: Substituir o hardcode `() => 'device-1'` na DI do caso de uso de vistoria por `() => user?.id || 'device-id-123'` obtido de `useAuth`.
- **Justificativa**: Alinha as regras do banco offline SQLite e backend Supabase para auditoria correta de quem criou as inspeções.

---

## Risks / Trade-offs

- **[Risco]**: Arquivos CSV gerados localmente e compartilhados podem ter problemas de codificação de caracteres (como acentuação em português) dependendo do leitor de planilhas.
  - **Mitigação**: Adicionar o marcador Byte Order Mark (BOM) UTF-8 (`\ufeff`) no início do conteúdo de texto do CSV para que o Excel e outros visualizadores identifiquem a codificação automaticamente.
