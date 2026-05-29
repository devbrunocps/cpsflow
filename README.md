# Atendente Inteligente para WhatsApp

Front-end SaaS em Next.js para configurar atendimento automatico no WhatsApp.
O projeto usa App Router, React, Tailwind CSS, componentes estilo ShadCN UI,
dados mockados e uma estrutura preparada para futura integracao com Firebase.

## Estrutura

```txt
app/
  (auth)/
    login/
    register/
  (dashboard)/
    dashboard/
    configuracoes/
    produtos/
    fluxos/
    mensagens/
components/
  layout/
  ui/
hooks/
lib/
```

## Paginas

- `/login`: tela de acesso.
- `/register`: cadastro inicial da empresa.
- `/dashboard`: visao geral do bot, mensagens e conversas recentes.
- `/configuracoes`: empresa, horario e mensagem fora do horario.
- `/produtos`: lista, criacao, edicao e exclusao local.
- `/fluxos`: fluxos por etapas com mensagens editaveis.
- `/mensagens`: FAQ e respostas automaticas.

## Rodar o projeto

Instale dependencias e execute o servidor local:

```bash
npm install
npm run dev
```

Depois acesse http://localhost:3000.

## Validacao

```bash
npm run lint
npm run build
```

## Observacoes

- Nao ha backend completo nesta etapa.
- Os dados estao em `lib/mock-data.ts`.
- A futura configuracao Firebase tem placeholder em `lib/firebase.ts`.
- Os componentes base ficam em `components/ui`, seguindo a proposta visual do ShadCN UI.
