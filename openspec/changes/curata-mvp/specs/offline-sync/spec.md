## ADDED Requirements

### Requirement: Sincronização offline → Supabase
O sistema SHALL sincronizar dados locais (ARTWORK, INSPECTION, PHOTO) com Supabase quando internet estiver disponível, usando last-write-wins por `updated_at`.

#### Scenario: Sync automático ao reconectar
- **WHEN** dispositivo reconecta à internet
- **THEN** sistema inicia sync de todos os registros com `synced_at = null` ou `updated_at > synced_at`

#### Scenario: Resolução de conflito
- **WHEN** mesmo registro foi editado em dois devices offline
- **THEN** sistema aplica a versão com `updated_at` mais recente e descarta a outra

### Requirement: Soft delete obrigatório
O sistema SHALL nunca deletar fisicamente registros. Deleções MUST propagar via campo `deleted_at`.

#### Scenario: Deleção offline
- **WHEN** usuário deleta uma obra offline
- **THEN** sistema seta `deleted_at = now()` localmente e propaga no próximo sync

#### Scenario: Recebimento de deleção via sync
- **WHEN** sync recebe registro com `deleted_at` preenchido
- **THEN** sistema oculta o registro da UI mas mantém no banco local

### Requirement: Upload de fotos com estado
O sistema SHALL gerenciar upload de fotos com rastreamento de estado por PHOTO.

#### Scenario: Upload bem-sucedido
- **WHEN** PHOTO com `upload_status: pending` é sincronizada com internet disponível
- **THEN** arquivo é comprimido, enviado ao Supabase Bucket, `remote_url` preenchida e `upload_status` atualizado para `done`

#### Scenario: Falha no upload
- **WHEN** upload de foto falha por erro de rede
- **THEN** `upload_status` é marcado como `failed` e sistema requeues na próxima sync
