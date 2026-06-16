## Why

Vários problemas críticos de experiência do usuário (UX), localização e relatórios técnicos foram identificados no aplicativo Curata. Ajustar esses erros é fundamental para garantir o funcionamento correto do MVP em ambiente de produção e fornecer uma experiência premium para os conservadores de arte em campo.

## What Changes

- **Acerto de navegação no Mapa**: O botão de ação (CTA) no popup de detalhes do marcador no `MapScreen` redirecionará corretamente para a tela de visualização detalhada da obra (`ArtworkDetail`) ao invés de abrir o formulário de cadastro de nova obra (`ArtworkForm`).
- **Inclusão de Fotos nos Relatórios PDF**: O `GenerateReportUseCase` será ajustado para renderizar as imagens das obras e inspeções no relatório em formato PDF, convertendo caminhos locais para esquemas válidos (`file://`) suportados pelo `expo-print`.
- **Suporte a Múltiplos Formatos nos Relatórios**: O gerador de relatórios passará a suportar os formatos selecionados pelo usuário (CSV e Excel) em `ReportGeneratorScreen`, exportando os dados das obras e inspeções estruturados de forma compatível.
- **Tratamento Amigável de Erros de Autenticação e Rate Limits**: As mensagens de erro exibidas no `RegisterScreen` e `LoginScreen` serão melhoradas, traduzindo erros técnicos do Supabase (como e-mail já cadastrado, senhas fracas ou rate limits excedidos) para mensagens claras e em português.
- **Linguagem Padrão pt-BR e Destaque Visual**: O aplicativo inicializará por padrão em Português do Brasil (`pt-BR`) e o seletor de idiomas no `ProfileScreen` será ajustado para exibir a cor ativa destacando o idioma atualmente selecionado.
- **Inconsistência de IDs de Dispositivo**: Ajuste no `InspectionFormScreen` para utilizar o ID real do usuário (`user.id`) como `deviceId` ao instanciar os casos de uso, garantindo consistência com a arquitetura do banco local SQLite e remoto Supabase.

## Capabilities

### New Capabilities
- `multi-format-report-export`: Capacidade de exportar relatórios nos formatos CSV e Excel (além do PDF já suportado), gerando e compartilhando arquivos estruturados a partir das tabelas locais do SQLite.

### Modified Capabilities
- `technical-report-generation`: O relatório técnico em PDF passa a renderizar corretamente as fotos locais/remotas das inspeções de acervo.
- `user-onboarding-and-auth`: O fluxo de cadastro e login passa a apresentar mensagens de erro robustas e amigáveis para falhas comuns (e-mail duplicado, limite de taxa de e-mails, validações).

## Impact

- **presentation/screens**: `MapScreen`, `ReportGeneratorScreen`, `RegisterScreen`, `ProfileScreen`, `InspectionFormScreen`, `InspectionDetailScreen`.
- **domain/usecases**: `GenerateReportUseCase`, `CreateInspectionUseCase`.
- **infrastructure/i18n**: Configuração inicial de inicialização de idioma no i18next.

## Non-goals

- Tradução dinâmica em tempo real de notas inseridas manualmente pelos usuários.
- Implementação de gráficos avançados ou estatísticas visuais complexas dentro dos arquivos exportados em PDF/Excel/CSV nesta versão MVP.
