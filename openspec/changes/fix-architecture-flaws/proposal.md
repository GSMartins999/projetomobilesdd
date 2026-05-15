# Proposal: Fix Architecture Flaws

## Goal
Resolver cinco vulnerabilidades arquiteturais graves no app Curata identificadas durante auditoria de código, garantindo segurança de dados em modo offline, performance na renderização React, e integridade nas migrações do banco de dados SQLite.

## Scope
### In Scope
1. **Sync Service:** Corrigir a lógica de geração de timestamp para não usar o relógio do cliente (Clock Skew).
2. **File Management:** Mover arquivos de foto temporários da câmera (`cacheDirectory`) para a pasta de documentos persistente (`documentDirectory`) antes do salvamento em banco.
3. **Duplicate Protection:** Fazer o `CreateArtworkUseCase` falhar se uma duplicata for detectada silenciosamente na hora do `save`, exigindo contorno explícito.
4. **React Performance:** Otimizar as telas `ArtworkFormScreen` e `InspectionFormScreen` com `useMemo` para impedir a instanciação dos casos de uso a cada digitação do usuário.
5. **Database Migrations:** Implementar suporte a `PRAGMA user_version` no `client.ts` para viabilizar futuras atualizações de schema sem crashar o app.

### Out of Scope
- Migração para novo banco de dados remoto (manteremos Supabase).
- Adicionar novas entidades ao schema neste momento.
