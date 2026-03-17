# 🎨 Curata — App de Conservação e Restauração de Arte

> Sessões de exploração: **06/03/2026** (produto e arquitetura) · **10/03/2026** (decisões técnicas e refinamentos)

---

## 📌 Visão Geral do Produto

**Curata** — do italiano *curare* (cuidar, tratar) — é um aplicativo móvel para profissionais de **restauração e conservação de arte** que permite registrar, fotografar e geolocalizar obras de arte espalhadas pelo mundo — especialmente obras encontradas em espaços públicos que necessitam de manutenção.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK **latest** + React Native + **TypeScript** |
| Build | **Expo Dev Client** ← obrigatório (react-native-maplibre requer GL nativo, incompatível com Managed Workflow puro) |
| Câmera | expo-camera |
| Geolocalização | expo-location |
| Armazenamento local | expo-sqlite + expo-file-system |
| Auth / Backend | Supabase (Auth + PostgreSQL + Storage Buckets) |
| Mapa | react-native-maplibre + OpenStreetMap (offline nativo, **não** Leaflet, **não** react-native-maps) |
| i18n | i18next + react-i18next + expo-localization |
| DI / Arch | Clean Architecture + Context API + factories (**não** tsyringe, **não** inversify) |
| Validação | zod (schema `technical_form` + entities) |
| Notificações | expo-notifications |
| PDF | react-native-html-to-pdf |
| Auth storage | expo-secure-store (JWT — **nunca** AsyncStorage) |
| ORM/Migrations | drizzle-orm (SQLite local com migrations) |
| Testes | **Jest** (domain/usecases/Zod) + **RNTL** `@testing-library/react-native` (presentation/components) + **Maestro** (E2E) |

---

## 🏛️ Clean Architecture

```
src/
├── domain/
│   ├── entities/        (Artwork, Inspection, User)
│   ├── usecases/        (RegisterArtwork, SyncData, GenerateReport...)
│   └── repositories/    (interfaces/contratos)
├── data/
│   ├── repositories/    (implementações dos contratos)
│   └── datasources/
│       ├── local/       (SQLite)
│       └── remote/      (Supabase)
├── presentation/
│   ├── screens/
│   ├── components/
│   └── hooks/           (useArtwork, useSync, useMap...)
└── infrastructure/
    ├── di/              (injeção de dependência)
    ├── navigation/
    └── i18n/
```

---

## 🗄️ Modelo de Dados

```
ARTWORK (obra)
├── id                   UUID — gerado localmente (evita colisões offline)
├── display_id           ART-YYYY-XXXXX — gerado pelo servidor no primeiro sync
├── name
├── artist               (opcional)
├── type                 (sculpture | mural | monument | azulejo | other)  ← enum
├── lat / lng
├── address              (geocoding reverso)
├── conservation_status  (good | regular | poor | urgent)  ← enum | label via i18n
├── created_at
├── updated_at           ← horário da AÇÃO (sync por aqui, preservado sempre)
├── synced_at            ← horário do upload ao servidor
├── deleted_at           ← nullable — soft delete (nunca deletar fisicamente)
├── device_id            ← identifica dispositivo de origem
└── created_by           (user_id)

INSPECTION (registro de inspeção)
├── id                   UUID
├── artwork_id           FK → ARTWORK.id
├── visit_date
├── notes                (texto livre)
├── status_at_visit      (good | regular | poor | urgent)  ← enum
├── technical_form       JSON estruturado — schema validado por Zod no domain
├── form_version         INTEGER DEFAULT 1 ← versão do schema Zod usado
├── updated_at
├── synced_at
├── deleted_at           ← nullable — soft delete
├── device_id            ← identifica dispositivo de origem
└── user_id

PHOTO (fotos de inspeção — relação 1-N com INSPECTION)
├── id                   UUID
├── inspection_id        FK → INSPECTION.id
├── local_path           ← caminho em expo-file-system
├── remote_url           ← URL Supabase Bucket (nullable até upload completo)
├── upload_status        (pending | uploading | done | failed)
├── label                (front | detail | context)  ← enum
├── order                ← posição na exibição
├── deleted_at
└── device_id

USER (local mínimo — espelho do Supabase Auth)
├── id                   UUID — mesmo id do Supabase Auth
├── name
├── avatar_url           ← para exibição offline
└── updated_at           ← atualizado a cada sync bem-sucedido
```

---

## 🔄 Estratégia de Sincronização (Offline-First)

- **Source of truth offline:** SQLite local
- **Resolução de conflitos:** Last-write-wins pelo `updated_at` (horário da ação, não do sync)
- **Dois timestamps distintos:**
  - `updated_at` → quando a usuária fez a ação (preservado sempre)
  - `synced_at` → quando chegou ao Supabase (preenchido no momento do upload)
- **Soft delete:** `deleted_at` propagado no sync — nunca deletar fisicamente
- **Fotos:** compressão automática antes do upload (max ~1200px / 300KB); estado: `pending | uploading | done | failed`

```
Campo (offline) → SQLite → internet → Supabase
                                       ↓
                            compara updated_at
                            vence o mais recente
                            puxa atualizações para o device

Deleção (offline) → seta deleted_at → SQLite → internet → Supabase
                                                            ↓
                                               propaga deleted_at
                                               nunca deleta fisicamente
```

---

## 🔐 Autenticação

- Login obrigatório apenas na **primeira vez**
- JWT armazenado no **expo-secure-store** (keychain criptografado)
- Supabase SDK gerencia **refresh automático** quando online
- **Offline com token expirado:** janela de graça de **7 dias** — o app exibe banner de aviso (*"Sessão expirada — reconecte para sincronizar"*) mas não bloqueia o acesso aos dados locais; após 7 dias sem renovação, exige novo login
- Dados modelados com `user_id` desde o início (prepara para equipe futura)

---

## 🗺️ Mapa Offline

- Biblioteca: **react-native-maplibre + OpenStreetMap** (offline-first nativo, sem WebView, sem chave de API)
- Download automático de tiles a cada **30 minutos**, raio de **10km**
- Configurável pelo usuário: automático / manual / somente WiFi
- Pausa quando bateria < 20%
- **Fallback:** mapa em branco com ponto GPS marcado

> ⚠️ **Decisão arquitetural:** Leaflet foi descartado — é uma biblioteca web (DOM) incompatível com React Native nativo.

---

## 🔍 Detecção de Obras Duplicadas

Combinação de duas estratégias:

1. **Geofence (~30m):** alerta automático ao registrar obra próxima de outra existente
2. **Revisão visual:** lista de obras próximas sempre visível durante o cadastro

```
Nova obra registrada → busca obras num raio de 30m
         ↓
    Encontrou?  →  "Existe 1 obra próxima. É a mesma?"
                   [Sim - vincular]  [Não - criar nova]
```

**Comportamento de [Vincular]:** foto e GPS capturados são descartados; a profissional é redirecionada para o `ArtworkDetailScreen` da obra existente, onde pode iniciar uma nova inspeção normalmente.

**Comportamento de [Criar nova]:** continua normalmente para `ArtworkFormScreen`.

---

## 📋 Formulário Técnico vs. Relatório Simples

### Formulário Técnico (para a profissional)
- Estado estrutural
- Estado superficial (pintura, fissuras, abrasões)
- Agentes de deterioração (umidade, grafite, poluição, impacto)
- Evidências de intervenção anterior
- Nível de urgência [1–5]
- Recomendação técnica (texto livre)
- Fotos etiquetadas (frente, detalhe, contexto)

### Relatório Simplificado (para leigos / outros profissionais)
- Nome e localização da obra
- Foto principal
- Estado em linguagem acessível
- O que foi encontrado (simplificado)
- Ação recomendada
- Nome da profissional + data

---

## 🔔 Notificações

- Lembretes de revisita para obras que:
  - Estão em estado **precário ou urgente**
  - Não recebem visita há **X dias** (configurável)
- Powered by: `expo-notifications` (notificações locais)
- ⚠️ **Limitação v1:** a verificação roda apenas ao abrir o app — sem background task. Se o app não for aberto, nenhuma notificação é disparada naquele dia.

---

## 🌐 Internacionalização

| Idioma | Código |
|---|---|
| Português (Brasil) | pt-BR |
| Inglês | en |
| Espanhol | es |

- Detecção automática pelo idioma do dispositivo
- Fallback: inglês

---

## 📊 Dashboard

```
📊 Meu Mapa de Obras
─────────────────────
Total: XX obras
🔴 Urgente: X
🟠 Precário: X
🟡 Regular: X
🟢 Bom estado: X
⏰ Sem visita há +90 dias: X
```

---

## 📱 Mapa de Telas (18 telas)

| Grupo | # | Tela |
|---|---|---|
| Sistema | 1 | Splash / Loading |
| Auth | 2 | Login |
| Auth | 3 | Onboarding (1ª vez) |
| Tab Bar | 4 | 🗺️ Mapa |
| Tab Bar | 5 | 📋 Lista de Obras |
| Tab Bar | 6 | 📊 Dashboard |
| Tab Bar | 7 | 👤 Perfil / Configurações |
| Obras | 8 | Detalhe da Obra |
| Obras | 9 | Nova Obra — Câmera |
| Obras | 10 | Nova Obra — Formulário |
| Obras | 11 | Formulário Técnico de Inspeção |
| Obras | 12 | Histórico de Inspeções |
| Obras | 13 | Detalhe de uma Inspeção |
| Relatórios | 14 | Gerador de Relatório |
| Relatórios | 15 | Preview do PDF |
| Busca | 16 | Busca & Filtros |
| Notificações | 17 | Central de Notificações |
| Config | 18 | Preferências (idioma + mapa) |

---

## 📦 Funcionalidades — Escopo v1

| # | Funcionalidade |
|---|---|
| 1 | Auth (login único + JWT offline) |
| 2 | Câmera + GPS + cadastro de obra |
| 3 | Formulário técnico de inspeção |
| 4 | Mapa com obras registradas |
| 5 | Offline-first (SQLite + sync Supabase) |
| 6 | Detecção de duplicatas (geofence + visual) |
| 7 | Relatório PDF (técnico + simplificado) |
| 8 | Notificações de revisita |
| 9 | Busca e filtros |
| 10 | Dashboard rápido |
| 11 | i18n (PT-BR, EN, ES) |
| 12 | Onboarding (1ª vez) |
| 13 | ID único de obra (ART-ANO-XXXXX) |
| 14 | Mapa offline (tiles 30min / 10km) |

**Para v2:** QR Code nas obras, colaboração em equipe, integração com IPHAN e registros oficiais.

---

## 📋 Requisitos Funcionais (RF)

| ID | Requisito |
|---|---|
| RF-01 | O sistema deve permitir que a usuária autentique-se com email e senha via Supabase Auth e permaneça logada offline usando JWT armazenado em `expo-secure-store`. |
| RF-02 | O sistema deve impedir o acesso ao app quando o JWT estiver expirado e não houver conexão para renová-lo. |
| RF-03 | O sistema deve exibir fluxo de onboarding na primeira execução, solicitando permissões de câmera e GPS com justificativa clara (LGPD). |
| RF-04 | O sistema deve permitir registrar uma nova obra capturando foto, obtendo coordenadas GPS, endereço por geocoding reverso e status de conservação. |
| RF-05 | O sistema deve gerar um `display_id` no formato `ART-YYYY-XXXXX` para cada obra, atribuído pelo servidor no primeiro sync (UUID gerado localmente antes do sync). |
| RF-06 | O sistema deve alertar a usuária quando uma nova obra for cadastrada a menos de 30m de outra já existente, oferecendo as ações [Vincular] ou [Criar nova]. |
| RF-07 | O sistema deve permitir registrar uma inspeção técnica por obra, com estado estrutural, estado superficial, agentes de deterioração, nível de urgência (1–5), recomendação técnica e até 10 fotos etiquetadas. |
| RF-08 | O sistema deve comprimir fotos automaticamente para no máximo 1200px / 300KB antes de armazená-las localmente. |
| RF-09 | O sistema deve sincronizar dados locais (ARTWORK, INSPECTION, PHOTO) com Supabase automaticamente ao detectar conexão, usando last-write-wins por `updated_at`. |
| RF-10 | O sistema deve nunca deletar registros fisicamente; deleções devem ser propagadas via campo `deleted_at`. |
| RF-11 | O sistema deve exibir um mapa com marcadores de todas as obras, coloridos pelo estado de conservação, usando react-native-maplibre com tiles OpenStreetMap. |
| RF-12 | O sistema deve baixar tiles de mapa automaticamente num raio de 10km a cada 30 minutos quando online, pausando se bateria estiver abaixo de 20%. |
| RF-13 | O sistema deve gerar relatório PDF em dois formatos: técnico (para profissionais) e simplificado (para leigos), ambos compartilháveis via share sheet nativa. |
| RF-14 | O sistema deve enviar notificações locais de revisita para obras com estado `poor` ou `urgent` sem nova inspeção após 90 dias (configurável). |
| RF-15 | O sistema deve permitir buscar obras por nome, artista ou endereço, combinável com filtros de tipo e estado de conservação. |
| RF-16 | O sistema deve exibir dashboard com contagem de obras por estado e atalhos para listas filtradas. |
| RF-17 | O sistema deve exibir toda a interface em pt-BR, en ou es, detectando o idioma do dispositivo automaticamente com fallback para inglês. |
| RF-18 | O sistema deve permitir troca de idioma nas Preferências sem reiniciar o aplicativo. |

---

## 🔒 Requisitos Não Funcionais (RNF)

### Desempenho
| ID | Requisito |
|---|---|
| RNF-01 | O mapa deve renderizar até 500 marcadores sem degradação visível de framerate (meta: 60fps). |
| RNF-02 | A tela Splash deve transitar para Login ou TabBar em no máximo 2 segundos em dispositivo de entrada. |
| RNF-03 | A geração de PDF deve concluir em no máximo **5 segundos** em dispositivos mid/high-end e **10 segundos** em dispositivos de entrada (≤ 3GB RAM, CPU quad-core ≤ 2GHz) para inspeções com até 10 fotos. Inspeções sem fotos devem gerar PDF em ≤ 2 segundos em qualquer device. |
| RNF-03b | A UI deve exibir barra de progresso incremental na geração do PDF, com etapas visíveis: "Preparando dados" → "Processando fotos" → "Gerando documento", para que o usuário perceba atividade mesmo em dispositivos lentos. |
| RNF-04 | Cada inspeção admite no máximo **10 fotos** de até 300KB cada (após compressão). |

### Escalabilidade de Dados (SQLite Local)
| ID | Requisito |
|---|---|
| RNF-04b | O banco SQLite local deve suportar até **1.000 obras** e **5.000 inspeções** por usuário sem degradação perceptível de performance nas queries de listagem e mapa (tempo de resposta ≤ 200ms em dispositivo de entrada). |
| RNF-04c | A tabela PHOTO pode acumular até **50.000 registros** (1.000 obras × 10 fotos × 5 inspeções). Índices obrigatórios: `inspection_id`, `upload_status`, `deleted_at` para garantir queries eficientes. |
| RNF-04d | Ao ultrapassar **800 obras** locais, o app deve exibir aviso de "Banco próximo do limite recomendado" e sugerir sync + arquivamento de obras antigas. O limite **nunca** deve bloquear cadastro — apenas alertar. |
| RNF-04e | Paginação obrigatória na Lista de Obras e Histórico de Inspeções: carregar **20 registros por página** (cursor-based, não offset) para evitar leitura total da tabela em listas grandes. |

### Disponibilidade e Offline
| ID | Requisito |
|---|---|
| RNF-05 | Todas as funcionalidades de cadastro, inspeção, mapa e visualização devem funcionar sem conexão à internet. |
| RNF-06 | Dados criados ou modificados offline devem ser sincronizados automaticamente ao reconectar, sem perda de informação. |
| RNF-07 | Fotos pendentes de upload devem ser re-enfileiradas automaticamente após falha de rede (estado `failed` → `pending`). |

### Segurança e Privacidade
| ID | Requisito |
|---|---|
| RNF-08 | O JWT de autenticação deve ser armazenado exclusivamente em `expo-secure-store` (Keychain/Keystore); nunca em AsyncStorage. |
| RNF-09 | Permissões de câmera e localização devem ser solicitadas com justificativa explícita antes do uso (LGPD/GDPR). |
| RNF-10 | Dados sensíveis (tokens, coordinates) não devem ser registrados em logs de produção. |
| RNF-11 | Acesso ao Supabase Storage deve ser restrito por `user_id` via Row-Level Security (RLS). |
| RNF-11b | O arquivo de banco SQLite (`curata.db`) deve ser armazenado no diretório privado do app (`expo-file-system` → `documentDirectory`), inacessível por outros apps e pelo backup padrão do sistema (Android: `android:allowBackup="false"` para o db; iOS: `NSURLIsExcludedFromBackupKey = true` no arquivo SQLite). |
| RNF-11c | Coordenadas GPS (lat/lng) presentes nas tabelas ARTWORK e INSPECTION são classificadas como **dados sensíveis de localização** (LGPD Art. 11). A exportação do PDF simplificado deve omitir coordenadas exatas, exibindo apenas o endereço aproximado (logradouro + bairro, sem número). O PDF técnico mantém coordenadas completas, destinado exclusivamente a profissionais autorizados. |
| RNF-11d | Fotos armazenadas localmente (`expo-file-system`) devem residir no diretório privado do app, excluídas de bibliotecas de fotos do sistema e de backups automáticos não criptografados. Ao fazer logout, todos os arquivos de foto locais e o banco SQLite devem ser apagados (`FileSystem.deleteAsync` + `SQLite.closeAsync`). |
| RNF-11e | Em dispositivos Android sem criptografia de disco habilitada (API < 29 com criptografia opcional), o app deve exibir banner de aviso: *"Seu dispositivo pode não ter criptografia de disco ativa. Recomendamos habilitar nas configurações de segurança do Android."* — sem bloquear o uso. |

### Plataforma e Compatibilidade
| ID | Requisito |
|---|---|
| RNF-12 | O app deve suportar iOS 16+ e Android 10+ (API 29+). |
| RNF-13 | O app deve funcionar em modo portrait e landscape em smartphones (tablets opcionais em v2). |
| RNF-14 | O bundle inicial deve ter menos de 50MB para permitir download em conexões móveis. |

### Usabilidade
| ID | Requisito |
|---|---|
| RNF-15 | Elementos interativos devem ter área mínima de toque de 44×44dp (diretrizes Apple HIG / Material). |
| RNF-16 | O app deve exibir feedback visual imediato (loading / skeleton) para operações com latência > 300ms. |

---

## 👤 Casos de Uso Principais

### UC-01 — Registrar nova obra em campo

**Ator:** Profissional de conservação 
**Pré-condição:** Usuária autenticada; permissões de câmera e GPS concedidas 
**Pós-condição:** Obra salva no SQLite local com `synced_at = null`

**Fluxo principal:**
1. Usuária abre o app e toca em "+ Nova obra"
2. Sistema abre câmera nativa
3. Usuária fotografa a obra
4. Sistema obtém coordenadas GPS e realiza geocoding reverso
5. Sistema exibe formulário com localização preenchida
6. Usuária preenche nome, tipo, estado de conservação e notas
7. Sistema verifica geofence de 30m — nenhuma obra próxima encontrada
8. Usuária salva; sistema cria ARTWORK com UUID local e `synced_at = null`

**Fluxos alternativos:**
- **4a. GPS indisponível:** sistema permite inserção manual de coordenadas ou endereço
- **7a. Obra próxima detectada:** sistema exibe alerta com obras próximas; usuária escolhe [Vincular] ou [Criar nova]
- **8a. Dispositivo sem internet:** sistema salva localmente e exibe indicador "Pendente de sync"

---

### UC-02 — Realizar inspeção em obra existente

**Ator:** Profissional de conservação 
**Pré-condição:** Obra cadastrada no sistema 
**Pós-condição:** Inspeção salva com formulário técnico e fotos (upload pendente se offline)

**Fluxo principal:**
1. Usuária acessa detalhe de uma obra
2. Toca em "Nova inspeção"
3. Preenche: estado estrutural, estado superficial, agentes de deterioração, urgência (1–5), recomendação
4. Adiciona fotos etiquetadas (frente, detalhe, contexto)
5. Sistema valida formulário (Zod) e salva INSPECTION + PHOTOs no SQLite
6. PHOTOs criadas com `upload_status: pending`

**Fluxos alternativos:**
- **3a. Campos obrigatórios não preenchidos:** sistema exibe erros inline sem fechar o formulário
- **4a. 10 fotos atingidas:** sistema bloqueia adição e informa o limite
- **5a. Offline:** inspeção salva localmente; fotos ficam com `upload_status: pending` até sync

---

### UC-03 — Sincronizar dados após trabalho offline

**Ator:** Sistema (automático) / Profissional de conservação (manual) 
**Pré-condição:** Existem registros locais com `synced_at = null` ou `updated_at > synced_at` 
**Pós-condição:** Dados locais e Supabase consistentes; `synced_at` atualizado

**Fluxo principal:**
1. Sistema detecta conexão disponível (NetInfo)
2. Busca registros ARTWORK, INSPECTION, PHOTO com sync pendente
3. Para cada registro: compara `updated_at` com versão no Supabase
4. Aplica versão mais recente (last-write-wins)
5. Envia PHOTOs com `upload_status: pending` para Supabase Bucket (comprimindo antes)
6. Atualiza `synced_at` e `remote_url` localmente
7. Busca atualizações do servidor (pull) e aplica localmente

**Fluxos alternativos:**
- **3a. Conflito detectado (mesmo `id`, `updated_at` diferente):** vence o mais recente; `device_id` registrado para auditoria
- **5a. Upload de foto falha:** `upload_status` fica como `failed`; requeued no próximo sync
- **2a–7a. Conexão cai durante sync:** operação interrompida de forma segura; retomada no próximo ciclo

---

### UC-04 — Gerar relatório para órgão público

**Ator:** Profissional de conservação 
**Pré-condição:** Inspeção com formulário técnico preenchido 
**Pós-condição:** PDF gerado e compartilhado

**Fluxo principal:**
1. Usuária acessa detalhe de uma inspeção
2. Toca em "Gerar relatório"
3. Seleciona formato: Técnico ou Simplificado
4. Sistema gera PDF (react-native-html-to-pdf) em até 5 segundos
5. Sistema exibe preview do PDF
6. Usuária toca em "Compartilhar" → share sheet nativa do SO

**Fluxos alternativos:**
- **3a. Formato simplificado:** PDF usa linguagem acessível sem jargão técnico
- **4a. Geração demora > 5s:** sistema exibe indicador de progresso

---

## 🗺️ Diagrama de Navegação

```
[Splash]
    │
    ├── JWT válido ──────────────────────────► [Tab Bar]
    │                                              │
    └── Sem JWT / expirado ──► [Login]             ├── 🗺️ Mapa
                                    │              │      └── [Detalhe Obra]
                          1ª vez   │              │              └── [Inspeção]
                             ▼     │              ├── 📋 Lista de Obras
                        [Onboarding]              │      └── [Detalhe Obra]
                             │                    ├── 📊 Dashboard
                             └──────────────────► │      └── [Lista filtrada]
                                                  └── 👤 Perfil
                                                         └── [Preferências]

[Modal Stack — sobre qualquer aba]
├── Flow Nova Obra: [Câmera] → [Formulário Obra]
│       └── (detecta duplicata?) → [Alerta geofence]
├── [Formulário de Inspeção]
│       └── [Camera inline] → fotos etiquetadas
├── [Gerador de Relatório] → [Preview PDF]
├── [Busca & Filtros]
└── [Central de Notificações]
```

---

## 🎯 Classificação Formal de Estados

### Estados de Conservação (`conservation_status`)

| Valor | Label (PT) | Critério de classificação | Cor |
|---|---|---|---|
| `good` | Bom | Obra estruturalmente íntegra; sem agentes de deterioração ativos; apenas manutenção preventiva recomendada | 🟢 `#5D8A5E` |
| `regular` | Regular | Danos superficiais leves (eflorescências, sujidade, micro-fissuras); não compromete estrutura; intervenção programada | 🟡 `#D4963A` |
| `poor` | Precário | Danos estruturais moderados (fissuras, desprendimento, corrosão); risco de agravamento rápido; intervenção urgente planejada | 🟠 `#E07B39` |
| `urgent` | Urgente | Risco iminente de perda parcial ou total; intervenção imediata necessária; pode exigir isolamento da área | 🔴 `#C0392B` |

### Nível de Urgência (`urgency_level` 1–5)

| Nível | Classificação | Significado |
|---|---|---|
| 1 | Baixíssima | Ação em 12 meses ou mais |
| 2 | Baixa | Ação em 6–12 meses |
| 3 | Moderada | Ação em 3–6 meses |
| 4 | Alta | Ação em 1–3 meses |
| 5 | Crítica | Ação imediata (< 30 dias); notificação automática disparada |

> Obras com `urgency_level = 5` acionam notificação imediata, independente do intervalo de 90 dias configurado.

---

## 🔷 Análise SWOT

| | Positivo | Negativo |
|---|---|---|
| **Interno** | **Forças:** nicho sem solução clara, offline-first real, stack moderno, Clean Arch, multilíngue, dual-report | **Fraquezas:** escopo amplo para v1, custo Supabase à escala, GPS ruim em interiores, sem modelo de negócio |
| **Externo** | **Oportunidades:** patrimônio histórico em pauta global, venda para municípios/museus/ONGs, integração com IPHAN | **Ameaças:** LGPD/GDPR, concorrentes grandes (Google Arts & Culture), adoção lenta em nicho cultural |

---

## 🎨 Diretrizes de Design

| Elemento | Decisão |
|---|---|
| Paleta primária | `#7C5C3E` — marrom sépia |
| Paleta acento | `#D4963A` — âmbar dourado |
| Superfície | `#F5F0E8` — off-white pergaminho |
| Urgente | `#C0392B` — vermelho tijolo |
| Bom estado | `#5D8A5E` — verde musgo |
| Fonte display | **Playfair Display** (serif) — títulos e headers |
| Fonte corpo | **DM Sans** (sans-serif) — texto e labels |
| Ícones | Minimalistas, estilo linha fina |
| Mapa | Tema claro estilo pergaminho (MapLibre style customizado) |
| Status | Código de cores por estado (🟢🟡🟠🔴) |

> Paleta e tipografia alinhadas com a skill `frontend-design`: sem Inter/Roboto, paleta com dominância clara, não balanceada.

---

## ⚠️ Pontos de Atenção Técnicos

1. **Conflito de sync** resolvido por `updated_at` — horário da ação, não do sync
2. **Compressão de fotos** antes do upload é crítica (Supabase free: 1GB storage)
3. **DI Container** definido: Context API + factories (tsyringe descartado — incompatível com Metro bundler)
4. **Migrations SQLite** via drizzle-orm para evitar quebras em atualizações
5. **Tiles de mapa** — configurar pausa automática com bateria < 20%
6. **LGPD** — solicitar permissões de câmera e GPS com justificativa clara
7. **Soft delete** obrigatório em todas as entidades — nunca deletar fisicamente

---

## ⚙️ Convenções de Desenvolvimento

| Área | Convenção |
|---|---|
| Commits | Conventional Commits (`feat`, `fix`, `chore`, `refactor`, `docs`) |
| Nomenclatura | PascalCase para componentes/entidades; camelCase para funções/variáveis |
| Testes — domain | **Jest**: usecases, entities, schemas Zod |
| Testes — presentation | **RNTL** (`@testing-library/react-native` + `@testing-library/jest-native`): screens e components |
| Testes — E2E | **Maestro**: fluxos completos (login → obra → inspeção) |
| Indicação de camada | Sempre indicar a camada Clean Arch afetada nas tasks: `[domain]`, `[data]`, `[presentation]`, `[infrastructure]` |

---

## ⚠️ Riscos e Trade-offs

| Risco | Mitigação |
|---|---|
| `updated_at` incorreto (relógio do device) → conflito silencioso | Validar no servidor que `updated_at` não é data futura; `device_id` para auditoria |
| react-native-maplibre — curva de aprendizado (configuração de tiles offline) | Testar download de tiles como **spike** no início do projeto, antes de outras features |
| drizzle-orm + expo-sqlite — integração relativamente nova | Criar **spike de migration** antes de modelar todas as entidades (task 2.1) |
| Supabase Storage free tier (1GB) atingido com fotos | Compressão obrigatória (300KB/foto) + limite de 10 fotos por inspeção |
| react-native-maplibre exige módulo GL nativo | **Resolvido:** Expo Dev Client adotado desde o início |

---

## 🚧 Limitações Explícitas (v1)

1. **Notificações:** verificação de obras sem revisita roda **apenas ao abrir o app** — sem background task. Se o app não for aberto, nenhuma notificação é disparada naquele dia.
2. **JWT grace period:** acesso offline mantido por até **7 dias** após expiração do token, com banner de aviso persistente — sem bloquear o uso dos dados locais.
3. **Tablets:** suportados opcionalmente em portrait; landscape em tablets é v2.
4. **Colaboração:** usuário solo em v1 — dados modelados com `user_id` para preparar equipe em v2.
5. **Mapa offline:** somente raio de 10km configurado automaticamente; sem download de área global.

---

## 🧠 Decision Log (Brainstorming — 10/03/2026)

| # | Decisão | Alternativas Consideradas | Escolha Final | Motivo |
|---|---|---|---|---|
| 1 | Biblioteca de mapa | Leaflet (web ❌), react-native-maps (sem offline), react-native-leaflet (WebView) | **react-native-maplibre** | Offline real nativo, sem WebView, alta performance |
| 2 | Soft delete | Deleção física | **`deleted_at` nullable** | Deleções offline precisam ser propagadas via sync |
| 3 | Estratégia de sync | CRDT, merge manual, last-write-wins | **Last-write-wins + `device_id`** | Adequado para solo v1; `device_id` prepara multi-device |
| 4 | DI Container | tsyringe, inversify | **Context API + factories** | Idiomático em RN; tsyringe conflita com Metro bundler |
| 5 | Fotos offline | Só URL remota | **`expo-file-system` (local) + URL remota** | URL Supabase não funciona offline |
| 6 | Armazenamento de fotos | Array em INSPECTION | **Tabela PHOTO separada (1-N)** | SQLite não tem array nativo; tabela permite labels e order |
| 7 | `conservation_status` | Enum em PT-BR | **Enum em inglês + i18n na UI** | Consistência com sistema de i18n já adotado |
| 8 | `technical_form` | Tabela INSPECTION_FORM com campos explícitos | **JSON + validação Zod + `form_version`** | Simples para v1; `form_version` garante compatibilidade com inspeções antigas ao evoluir o schema |
| 9 | Entity User local | Sem entity local, User entity completa | **User mínimo (id, name, avatar_url)** | Necessário para exibição offline sem chamada de API |
| 10 | ID de obra | Sequencial (ART-YYYY-XXXXX) como primary key | **UUID interno + display_id gerado no sync** | UUID evita colisões entre devices offline |
| 11 | Build workflow | Managed Workflow puro | **Expo Dev Client** | react-native-maplibre requer módulo GL nativo, incompatível com Managed Workflow puro |
| 12 | JWT expirado offline | Bloquear acesso imediatamente | **Janela de graça de 7 dias + banner de aviso** | Bloquear offline torna o app inutilizável em campo estendido |
| 13 | Atualização de `conservation_status` | Manual pela profissional | **Automática via `CreateInspectionUseCase`** | Status deve sempre refletir a avaliação mais recente sem ação manual |
| 14 | Fluxo de [Vincular] duplicata | Manter foto/GPS ou redirecionar com dados | **Descarta foto+GPS, redireciona para obra existente** | Simplifica UX; profissional inicia inspeção normalmente na obra correta |
| 15 | Verificação de notificações | Background task periódica | **Apenas ao abrir o app** | Suficiente para o perfil de uso; evita complexidade de background fetch |

---

> **Status do projeto (17/03/2026):**
> - ✅ `curata-mvp` change criado com `proposal.md`, `design.md`, specs por capability e `tasks.md` (15 grupos, ~60 tasks)
> - ✅ Dependências instaladas (`node_modules` gerado)
> - ⏳ Implementação pendente — próximo passo: `/opsx-apply` para iniciar pela task 1.1 (setup Expo Dev Client)
