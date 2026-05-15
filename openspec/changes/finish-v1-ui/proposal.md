# Proposal: Finish V1 UI (Placeholders & Wiring)

## Context
A auditoria arquitetural identificou que o aplicativo está com 90% da UI concluída, mas possui dados mocados ("placeholders") e funcionalidades desvinculadas em telas cruciais, impedindo que o MVP (V1) atinja 100% de conclusão.

## Goal
Substituir as interfaces estáticas por lógicas funcionais conectadas à arquitetura do projeto.
- Tornar os Relatórios PDF interativos por datas reais.
- Ligar o Dashboard aos dados locais do SQLite.
- Preparar infraestrutura local de Notificações para lembretes de revisita.
- Finalizar gatilhos da tela de Perfil.

## Scope
### In Scope
- `ProfileScreen.tsx`: Ligar botão de "Sincronizar agora" ao `useSync`.
- `DashboardScreen.tsx`: Substituir `emptyInspections` por listagem das últimas 5 inspeções realizadas, lidas via repositório.
- `ReportGeneratorScreen.tsx`: Implementar `DateTimePicker` nativo ou da comunidade para permitir seleção de datas (período do relatório).
- `NotificationsScreen.tsx`: Adicionar biblioteca `expo-notifications`, criar um gerenciador simples para lembretes locais e limpar as notificações mocadas.

### Out of Scope
- Configuração de Push Notifications via servidor / Firebase (APN/FCM). Para o MVP, usaremos apenas Local Notifications agendadas pelo próprio app.
- Separação rigorosa de todos os componentes de UI em arquivos isolados (vamos focar apenas no funcionamento lógico).
