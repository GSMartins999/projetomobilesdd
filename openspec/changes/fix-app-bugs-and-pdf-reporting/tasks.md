## 1. Correção de Navegação e UX no Mapa

- [x] 1.1 [TEST] Adicionar teste no `MapScreen.test.tsx` para cobrir o redirecionamento correto ao clicar no CTA do popup (Camada: presentation)
- [x] 1.2 Corrigir o redirecionamento do botão CTA do popup do `MapScreen` para levar à tela `ArtworkDetail` com a chave do ID (Camada: presentation)

## 2. Relatório Técnico Multiformato e Renderização de Fotos

- [x] 2.1 [TEST] Adicionar teste no `GenerateReportUseCase.test.ts` para validar o parser e renderização de URLs locais e remotas com imagem (Camada: domain)
- [x] 2.2 Atualizar o `GenerateReportUseCase.ts` para renderizar fotos no HTML do PDF utilizando `ImageUtils.getImageUri` (Camada: domain)
- [x] 2.3 [TEST] Criar teste para a lógica de exportação em CSV no `ReportGeneratorScreen` (Camada: presentation)
- [x] 2.4 Implementar a geração e exportação de relatórios em formato CSV/Planilha no `ReportGeneratorScreen` utilizando `Sharing.shareAsync` com o BOM UTF-8 (Camada: presentation)

## 3. Tradução e Tratamento Amigável de Erros de Auth

- [x] 3.1 [TEST] Adicionar testes unitários no novo helper `AuthErrorHelper.test.ts` para validar a tradução correta dos erros do Supabase (Camada: infrastructure)
- [x] 3.2 Criar o helper `AuthErrorHelper.ts` na camada de infraestrutura para capturar e traduzir mensagens de erro do Supabase (Camada: infrastructure)
- [x] 3.3 [TEST] Atualizar testes das telas de cadastro e login para verificar a exibição de erros amigáveis (Camada: presentation)
- [x] 3.4 Integrar o `AuthErrorHelper` nas telas `RegisterScreen` e `LoginScreen` para exibir as mensagens de erro traduzidas (Camada: presentation)

## 4. Configurações de Localização (pt-BR) e Estado Visual

- [x] 4.1 [TEST] Criar testes unitários para a inicialização da i18n com `pt-BR` por padrão (Camada: infrastructure)
- [x] 4.2 Alterar a configuração padrão do `i18n` para inicializar a aplicação com `pt-BR` como idioma primário (Camada: infrastructure)
- [x] 4.3 [TEST] Adicionar teste no `ProfileScreen.test.tsx` para cobrir o estilo visual ativo da pílula de seleção de idioma (Camada: presentation)
- [x] 4.4 Atualizar a UI do `ProfileScreen.tsx` para que a pílula correspondente ao idioma ativo receba a estilização visual colorida (Camada: presentation)

## 5. Consistência de Device ID no Fluxo de Inspeção

- [x] 5.1 [TEST] Atualizar testes do `InspectionFormScreen` para validar o uso do ID do usuário autenticado como `deviceId` (Camada: presentation)
- [x] 5.2 Modificar o `InspectionFormScreen.tsx` para importar `useAuth` e passar o ID do usuário conectado (`user.id` ou fallback) para o caso de uso (Camada: presentation)

## 6. Testes Finais e Validação E2E

- [x] 6.1 [TEST] Atualizar o fluxo de teste E2E do Maestro (`happy_path.yaml`) para refletir e validar a nova navegação de detalhes e fluxo de inspeção (Camada: infrastructure)
