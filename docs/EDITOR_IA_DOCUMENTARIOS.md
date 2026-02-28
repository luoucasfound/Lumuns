# Editor de Vídeo com IA para Documentários (History/BBC style)

## 1) Visão do produto
Criar um **editor de vídeo assistido por IA** focado em documentários, com fluxo intuitivo para uma pessoa não-técnica, mantendo consistência de:
- estética visual,
- estrutura de roteiro,
- estilo de narração,
- trilha e design de som,
- animações de imagem (pan/zoom/parallax),
- ritmo de edição.

Objetivo: permitir que cada novo vídeo pareça parte da mesma “coleção editorial”.

---

## 2) Princípios de UX (intuitivo de verdade)
1. **Fluxo guiado em etapas** (wizard):
   - Tema → Pesquisa → Roteiro → Narração → Montagem → Refinamento → Export.
2. **Copiloto com ações prontas**:
   - Botões tipo “Gerar abertura estilo BBC”, “Aplicar ritmo documental”, “Criar versão 16:9 + shorts”.
3. **Preview instantâneo**:
   - Alterou trilha, zoom, tom de voz? Ver resultado em segundos.
4. **Modo iniciante e avançado**:
   - Iniciante: 80% automatizado.
   - Avançado: timeline completa com keyframes.

---

## 3) Arquitetura de alto nível
### Camada A — Identidade Editorial (o “cérebro de estilo”)
- **Style DNA** (JSON versionado):
  - Paleta de cor, LUTs, tipografia, lower thirds, transições, intensidade de trilha,
  - regras de câmera virtual (zoom in/out, movimentos permitidos),
  - cadência narrativa (abertura, contexto, conflito, evidências, conclusão).
- **Template Engine**:
  - aplica presets por tipo de episódio (“biografia”, “evento histórico”, “mistério”).

### Camada B — IA de Conteúdo
- **RAG histórico** (base local + fontes confiáveis):
  - transforma pesquisa em roteiro com citações e checagem de consistência.
- **Gerador de roteiro por blocos**:
  - Hook (30s), ato 1, ato 2, clímax, fechamento.
- **Narration AI**:
  - vozes com timbre documental,
  - controle de pausas, ênfase e pronúncia de nomes históricos.

### Camada C — IA de Edição
- **Auto-rough cut**:
  - monta 1ª versão com base no roteiro e marcadores de voz.
- **Ken Burns inteligente**:
  - pan/zoom em fotos com detecção de rosto/objeto.
- **B-roll matcher**:
  - sugere imagens/vídeos de apoio por trecho narrado.
- **Sound design automático**:
  - trilha documental + ducking + efeitos sutis de transição.

### Camada D — Timeline Profissional
- timeline multipista,
- keyframes,
- máscaras,
- legendas automáticas,
- export master e social.

---

## 4) Banco de dados de consistência (sua ideia central)
Para manter “sempre a mesma estética”, use 4 bancos:

1. **Style Library DB**
   - presets visuais/sonoros (com versões).
2. **Script Pattern DB**
   - estruturas narrativas aprovadas.
3. **Asset Memory DB**
   - trilhas, SFX, transições e animações favoritas com tags.
4. **Decision Log DB**
   - registra escolhas por episódio (o que funcionou e o que evitar).

Com isso, a IA aprende seu padrão e reaplica automaticamente.

---

## 5) Pipeline sugerido (MVP → Pro)
### MVP (8–12 semanas)
- Ingestão de tema + referências.
- Roteiro semi-automático (com revisão humana).
- Narração IA com 2–3 vozes.
- Auto montagem básica com pan/zoom e trilha.
- Export 16:9 e 9:16.
- Salvar/recuperar preset editorial único.

### Fase 2
- RAG completo com citação de fontes.
- Biblioteca de templates “History/BBC inspired”.
- Melhorias de color e audio mix automático.
- Colaboração (comentários por cena).

### Fase 3
- Fine-tuning de estilo por projeto.
- Agente “Editor-Chefe” que critica pacing/clareza.
- Geração de teaser automático.

---

## 6) Stack técnica recomendada
- **Frontend**: React + Next.js + timeline custom (Canvas/WebGL).
- **Backend**: Python (FastAPI) + workers de render.
- **IA texto**: LLM + RAG (vetor DB).
- **IA áudio**: TTS neural + separação de trilha/voz.
- **IA visual**: detecção de cenas, pan/zoom inteligente, sugestão de B-roll.
- **Render**: FFmpeg pipeline + filas assíncronas.
- **Dados**: PostgreSQL (metadados) + armazenamento de mídia (S3 compatível).

---

## 7) Regras de qualidade para “cara de documentário premium”
- Narração com variação de ritmo e pausas dramáticas.
- Música com dinâmica por ato (não volume constante).
- Movimento de imagem lento e proposital (evitar excesso).
- Texto na tela minimalista e legível.
- Verificação factual mínima antes de exportar.

---

## 8) Riscos e mitigação
- **Direitos autorais de assets** → usar bibliotecas licenciadas e controle de origem.
- **Alucinação no roteiro** → citação obrigatória e score de confiabilidade.
- **Visual “genérico de IA”** → presets autorais + ajuste manual rápido.
- **Render lento** → proxies e export incremental.

---

## 9) Próximos passos práticos
1. Definir 3 tipos de episódio que você quer produzir primeiro.
2. Criar seu **Style DNA v1** (cor, fonte, trilha, ritmo, transições).
3. Implementar MVP com foco em: roteiro + narração + auto-rough-cut.
4. Rodar 5 episódios piloto e alimentar o Decision Log.
5. Ajustar IA com base no que teve mais retenção de audiência.

Se quiser, posso transformar isso no próximo passo em:
- **PRD completo** (requisitos funcionais + técnicos),
- **backlog de sprints**,
- **wireframes da interface**,
- e **arquitetura de banco** em tabelas.
