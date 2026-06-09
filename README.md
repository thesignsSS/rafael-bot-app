# bot-rafael-app

Frontend SPA com [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev) e [Tailwind CSS](https://tailwindcss.com) v4. Projeto em estágio inicial (scaffold).

## Documentação

| Arquivo | Público | Conteúdo |
|---------|---------|----------|
| [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) | Humanos | Estado do app, stack, estrutura, limitações e próximos passos |
| [AGENTS.md](AGENTS.md) | Agentes de IA | Setup, convenções, lint, build e troubleshooting |

## Pré-requisitos

- Node.js 20.19+ ou 22.12+

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

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (obrigatório para dev).

## Permissionamento (dev)

Perfis **admin** e **corretor** vêm de `app_metadata.role` no Supabase Auth (não use `user_metadata` para roles). Detalhes em [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md#permissionamento).

### Promover usuário a administrador

No Supabase Dashboard → **SQL Editor**, substitua o e-mail e execute:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'seu-email@exemplo.com';
```

Para voltar a corretor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "corretor"}'::jsonb
where email = 'seu-email@exemplo.com';
```

Depois da alteração, faça **logout e login** no app para o JWT carregar o novo perfil.

## Estado atual (resumo)

- Uma tela estática de boas-vindas em `App.tsx`
- TypeScript em modo `strict`
- Sem roteamento, testes, API ou variáveis de ambiente
- Detalhes completos em [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md)
