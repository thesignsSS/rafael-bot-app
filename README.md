# bot-rafael-app

Frontend SPA do Rafael Bot com [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com) v4 e auth via Supabase.

## Documentação

| Arquivo | Público | Conteúdo |
|---------|---------|----------|
| [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) | Humanos | Estado do app, stack, estrutura, limitações e próximos passos |
| [AGENTS.md](AGENTS.md) | Agentes de IA | Setup, convenções, lint, build e troubleshooting |

## Pré-requisitos

- Node.js 20.19+ ou 22.12+
- `.env` baseado em `.env.example`

## Comandos

```bash
npm install
npm run dev        # desenvolvimento (http://localhost:5173)
npm run build      # typecheck (tsc) + build → dist/
npm run typecheck  # apenas verificação de tipos
npm run preview    # preview do build
npm run lint       # ESLint
```

## Estrutura resumida

```
src/
├── main.tsx       # entrada React
├── App.tsx        # componente raiz
├── vite-env.d.ts  # tipos do Vite
└── index.css      # @import "tailwindcss"
vite.config.ts     # react() + tailwindcss()
tsconfig.json      # referências app + node
```

## Estado atual (resumo)

- Login/cadastro/recuperação de senha com Supabase
- Rota protegida com formulário de proposta imobiliária
- Busca de municípios do Ceará via API pública do IBGE
- Envio da proposta e anexos para o servidor do bot via `VITE_FORM_SUBMISSION_API_URL`
- TypeScript em modo `strict`
- Sem testes configurados
- Detalhes completos em [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md)
