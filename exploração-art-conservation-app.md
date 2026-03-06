# 🎨 Exploração: App de Conservação e Restauração de Arte

> Sessão de exploração realizada em 06/03/2026

---

## 📌 Visão Geral do Produto

Um aplicativo móvel para profissionais de **restauração e conservação de arte** que permite registrar, fotografar e geolocalizar obras de arte espalhadas pelo mundo — especialmente obras encontradas em espaços públicos que necessitam de manutenção.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Expo + React Native |
| Câmera | expo-camera |
| Geolocalização | expo-location |
| Banco local | expo-sqlite |
| Auth / Backend | Supabase (Auth + PostgreSQL + Storage Buckets) |
| Mapa | Leaflet + OpenStreetMap (suporte offline) |
| i18n | i18next + react-i18next + expo-localization |
| DI / Arch | Clean Architecture + Context API ou tsyringe |
| Notificações | expo-notifications |
| PDF | react-native-html-to-pdf |
| Auth storage | expo-secure-store (JWT) |
| ORM/Migrations | drizzle-orm (SQLite local com migrations) |

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
├── id                   (ART-2026-00001 — ID único gerado)
├── name
├── artist               (opcional)
├── type                 (escultura | mural | monumento | azulejo | ...)
├── lat / lng
├── address              (geocoding reverso)
├── conservation_status  (bom | regular | precário | urgente)
├── created_at
├── updated_at           ← horário da AÇÃO (sync por aqui)
├── synced_at            ← horário do upload ao servidor
└── created_by           (user_id)

INSPECTION (registro de inspeção)
├── id
├── artwork_id
├── visit_date
├── photos[]             → Supabase Bucket (comprimidas)
├── notes                (texto livre)
├── status_at_visit
├── technical_form       (JSON estruturado)
├── updated_at
├── synced_at
└── user_id
```

---

## 🔄 Estratégia de Sincronização (Offline-First)

- **Source of truth offline:** SQLite local
- **Resolução de conflitos:** Last-write-wins pelo `updated_at` (horário da ação, não do sync)
- **Dois timestamps distintos:**
  - `updated_at` → quando a usuária fez a ação (preservado sempre)
  - `synced_at` → quando chegou ao Supabase (preenchido no momento do upload)
- **Fotos:** compressão automática antes do upload (max ~1200px / 300KB)

```
Campo (offline) → SQLite → internet → Supabase
                                       ↓
                            compara updated_at
                            vence o mais recente
                            puxa atualizações para o device
```

---

## 🔐 Autenticação

- Login obrigatório apenas na **primeira vez**
- JWT armazenado no **expo-secure-store** (keychain criptografado)
- Supabase SDK gerencia **refresh automático** quando online
- Offline: usa token local sem nova autenticação
- Dados modelados com `user_id` desde o início (prepara para equipe futura)

---

## 🗺️ Mapa Offline

- Biblioteca: **Leaflet + OpenStreetMap** (gratuito, sem chave de API)
- Download automático de tiles a cada **30 minutos**, raio de **10km**
- Configurável pelo usuário: automático / manual / somente WiFi
- Pausa quando bateria < 20%
- **Fallback:** mapa em branco com ponto GPS marcado

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
- Powered by: `expo-notifications`

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
| Auth | 1 | Splash / Loading |
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

## 🔷 Análise SWOT

| | Positivo | Negativo |
|---|---|---|
| **Interno** | **Forças:** nicho sem solução clara, offline-first real, stack moderno, Clean Arch, multilíngue, dual-report | **Fraquezas:** escopo amplo para v1, custo Supabase à escala, GPS ruim em interiores, sem modelo de negócio |
| **Externo** | **Oportunidades:** patrimônio histórico em pauta global, venda para municípios/museus/ONGs, integração com IPHAN | **Ameaças:** LGPD/GDPR, concorrentes grandes (Google Arts & Culture), adoção lenta em nicho cultural |

---

## 🎨 Diretrizes de Design (Sugestão)

| Elemento | Sugestão |
|---|---|
| Paleta | Tons terrosos / sépia + off-white + acento âmbar |
| Tipografia | Serif para títulos (Lora/Playfair) + sans para corpo |
| Ícones | Minimalistas, estilo linha fina |
| Mapa | Tema claro estilo pergaminho |
| Status | Código de cores por estado (🟢🟡🟠🔴) |

---

## ⚠️ Pontos de Atenção Técnicos

1. **Conflito de sync** resolvido por `updated_at` — horário da ação, não do sync
2. **Compressão de fotos** antes do upload é crítica (Supabase free: 1GB storage)
3. **DI Container** a definir: `tsyringe` ou Context API + factories
4. **Migrations SQLite** via drizzle-orm para evitar quebras em atualizações
5. **Tiles de mapa** — configurar pausa automática com bateria < 20%
6. **LGPD** — solicitar permissões de câmera e GPS com justificativa clara

---

> **Próximo passo:** `/opsx-propose` para gerar o change proposal completo com design, spec técnica e tarefas de implementação.
