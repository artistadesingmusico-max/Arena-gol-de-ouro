---
name: Contratos de data e validação
description: Compatibilidade entre datas de calendário, OpenAPI e versões de Zod no workspace.
---

Parâmetros OpenAPI com `format: date` podem chegar ao servidor como texto HTTP mesmo quando o schema gerado usa `Date`; normalize-os para `YYYY-MM-DD` antes das consultas ao banco.

**Why:** Datas de agenda representam dias locais, não instantes. Misturar `Date` com colunas PostgreSQL de calendário produz falhas de validação ou deslocamentos de fuso.

**How to apply:** Use colunas `date` com modo string para agenda e converta explicitamente os parâmetros de rota/query na borda. Mantenha a versão do catálogo Zod compatível com os helpers emitidos pelo Orval.