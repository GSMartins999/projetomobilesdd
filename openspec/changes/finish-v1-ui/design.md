# Design: Finish V1 UI

## Approach

### 1. Perfil (Sync Trigger)
A tela de perfil (`ProfileScreen.tsx`) já importa o contexto de autenticação, mas não o de sincronização.
- Importaremos `useSync` e vincularemos `triggerSync` ao `onPress` do card de Sincronização.

### 2. Dashboard (Recent Inspections)
A tela de `DashboardScreen.tsx` obtém estatísticas via `GetDashboardStatsUseCase`.
- Precisamos buscar dados completos das inspeções recentes.
- A solução será adicionar o `inspectionRepository` à tela (já disponível no DI) e realizar um `findAll()` com ordenação e limite no cliente, ou refatorar o caso de uso para incluir as últimas inspeções (lista de entidades) no objeto `DashboardStats`.
- **Decisão:** Atualizar a UI para iterar e desenhar *cards* das últimas 3-5 inspeções, usando a estilização de lista já padronizada no app.

### 3. Relatórios (DateTimePicker)
O `ReportGeneratorScreen.tsx` possui *views* clicáveis mocadas com datas fixas ("01/04/2026").
- Precisamos instalar o pacote oficial `@react-native-community/datetimepicker`.
- Criaremos modais/overlays no iOS e comportamentos nativos no Android ao clicar nessas *views*, atualizando estados React (`startDate` e `endDate`).

### 4. Notificações (Expo Notifications)
O MVP exige "Notificações de Revisita". 
- Instalaremos `expo-notifications`.
- Criaremos um `NotificationService` ou caso de uso que agenda uma notificação local (ex: para daqui a 15 dias) ao final do salvamento de uma inspeção.
- Na tela `NotificationsScreen.tsx`, removeremos o array estático e usaremos estado local ou Contexto para listar os gatilhos registrados.
