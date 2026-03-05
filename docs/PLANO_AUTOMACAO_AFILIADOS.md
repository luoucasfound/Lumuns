# Plano prático — operação de afiliados com automação diária

## 1) Posicionamento do negócio
- **Nicho principal**: aparelhos e acessórios de informática.
- **Subnichos** (começar com 1 ou 2):
  - setup home office;
  - periféricos gamer de entrada;
  - upgrades baratos (SSD, memória, roteador, webcam).
- **Oferta**: curadoria + comparação + recomendação com link de afiliado.

## 2) Stack mínima de automação
- **Planejamento de conteúdo**: planilha/CSV com data, plataforma, copy, mídia, link.
- **Geração assistida de copy**: IA para rascunho (com revisão humana).
- **Distribuição multicanal**: APIs oficiais ou agregador (Buffer/Metricool/Publer).
- **Rastreamento**: parâmetros UTM + encurtador + dashboard semanal.

## 3) Rotina operacional (90 minutos por semana)
1. Pesquisar 10 produtos com boa comissão e reputação.
2. Criar 21 posts (3 por dia) no calendário.
3. Gerar variações de copy por plataforma.
4. Revisar compliance (evitar promessas exageradas).
5. Agendar com script/API.
6. Medir cliques, CTR, conversão e ajustar próxima semana.

## 4) Arquitetura recomendada
- `automation/posts_calendar.csv`: calendário de posts.
- `automation/posting_automation.py`: lê o CSV e dispara agendamento/publicação.
- Execução por `cron` (ex.: a cada 10 minutos):

```bash
*/10 * * * * /usr/bin/python3 /workspace/Lumuns/automation/posting_automation.py --csv /workspace/Lumuns/automation/posts_calendar.csv >> /workspace/Lumuns/automation/automation.log 2>&1
```

## 5) Como usar o script do projeto
1. Preencha `automation/posts_calendar.csv`.
2. Configure variáveis de ambiente:
   - `BUFFER_ACCESS_TOKEN`
   - `BUFFER_PROFILE_INSTAGRAM`
   - `BUFFER_PROFILE_FACEBOOK`
   - `BUFFER_PROFILE_X`
   - `BUFFER_PROFILE_LINKEDIN`
3. Rodar em simulação:

```bash
python3 automation/posting_automation.py --csv automation/posts_calendar.csv
```

4. Publicar de verdade:

```bash
python3 automation/posting_automation.py --csv automation/posts_calendar.csv --publish
```

## 6) Metas iniciais (30 dias)
- Publicar 2–3 vezes ao dia em 3 plataformas.
- Atingir 3%+ de CTR médio por post com link.
- Encontrar top 20% de produtos que geram 80% dos cliques.
- Escalar somente o que converte.

## 7) Regras importantes
- Use **somente APIs oficiais** e respeite os termos das plataformas.
- Tenha revisão humana antes da publicação automática.
- Nunca publique preço/promoção sem data e fonte.
