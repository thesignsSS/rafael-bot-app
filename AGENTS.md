# AGENTS.md

Instruções para agentes de código que trabalham neste repositório. Formato compatível com [agents.md](https://agents.md/).

## Project Overview

**bot-rafael-app** é um frontend SPA para interface do bot “Rafael”. Auth via **Supabase** (e-mail/senha); rota `/` protegida. Lógica do bot ainda não implementada.

| Tecnologia | Uso |
|------------|-----|
| React 19 | UI (TSX) |
| TypeScript 5.8 | Tipagem estrita (`strict`) |
| Vite 6 | Dev server, HMR, build |
| Tailwind CSS 4 | Estilos via `@tailwindcss/vite` |
| ESLint 9 + typescript-eslint | Lint em `.ts` / `.tsx` |
| `@supabase/supabase-js` | Auth (sessão, login) |
| `sonner` | Toasts de feedback |

Documentação humana do estado atual: [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md).

## Setup Commands

```bash
npm install
```

- Node.js: 20.19+ ou 22.12+.
- Gerenciador de pacotes: **npm** (`package-lock.json` presente).
- Copie `.env.example` → `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (obrigatório para dev).

## Development Workflow

```bash
npm run dev        # http://localhost:5173 (porta padrão Vite)
npm run build      # tsc -b && vite build → dist/
npm run typecheck  # tsc -b --noEmit (só tipos)
npm run preview    # preview do build
npm run lint       # ESLint em todo o projeto
```

- Ponto de entrada: `src/main.tsx` → `src/App.tsx`.
- Estilos globais: `src/index.css` com `@import "tailwindcss";`.
- Tipos do Vite: `src/vite-env.d.ts` (`/// <reference types="vite/client" />`).
- **Não** criar `tailwind.config.js` ou `postcss.config.js` para Tailwind v4 — usar plugin em `vite.config.ts` e CSS com `@theme` se precisar de tokens customizados.
- Imports de fontes externas (`@import url(...)`) devem vir **antes** de `@import "tailwindcss"` em `index.css`.

## Testing Instructions

Testes **não estão configurados**. Ao adicionar Vitest:

- Colocar testes junto aos módulos (`*.test.tsx`) ou em `src/__tests__/`.
- Documentar o comando em `package.json` e atualizar esta seção.
- Rodar `npm run lint` e `npm run typecheck` após mudanças.

## Code Style

- **TypeScript + TSX** em todo o código-fonte da aplicação; não adicionar `.jsx` / `.js` em `src/`.
- `tsconfig.app.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`.
- Componentes funcionais; export default em componentes de página.
- `main.tsx` usa `StrictMode`, `createRoot` e non-null assertion em `#root` (`getElementById('root')!`).
- Estilização: classes Tailwind no TSX; evitar CSS por componente até haver necessidade.
- ESLint flat config em `eslint.config.js` com `typescript-eslint`; escopo `**/*.{ts,tsx}`.
- Organização sugerida ao crescer:
  - `src/components/` — UI reutilizável
  - `src/pages/` — telas (quando houver router)
  - `src/hooks/`, `src/lib/`, `src/services/` — conforme necessidade
- Idioma da UI: `index.html` usa `lang="pt-BR"`.

## Build and Deployment

```bash
npm run build
```

- `tsc -b` valida tipos antes do bundle Vite.
- Output: `dist/` (estático).
- Variáveis de ambiente: prefixo `VITE_`, tipar em `src/vite-env.d.ts` quando necessário:

```ts
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}
```

- Não commitar `.env` com segredos; usar `.env.example` quando introduzir env vars.

## Pull Request Guidelines

- Mensagens de commit claras (português ou inglês).
- Antes de PR: `npm run lint`, `npm run typecheck` e `npm run build` devem passar.
- Escopo mínimo: não refatorar arquivos não relacionados à tarefa.
- Atualizar [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) e este `AGENTS.md` quando mudar arquitetura ou convenções.

## Security Considerations

- Não commitar tokens, chaves de API ou `.env` com credenciais.
- Links externos: `rel="noreferrer"` com `target="_blank"`.
- Ao integrar APIs do bot, validar CORS e não expor segredos no bundle do cliente.

## Debugging and Troubleshooting

| Problema | Ação |
|----------|------|
| Estilos Tailwind não aplicam | Confirmar `import './index.css'` em `main.tsx` e `tailwindcss()` em `vite.config.ts` |
| Erro de tipo no build | `npm run typecheck` e corrigir antes de `vite build` |
| Build falha após novas deps | `rm -rf node_modules && npm install` |
| Porta 5173 em uso | `vite --port 5174` ou `server.port` em `vite.config.ts` |
| App não inicia / erro Supabase | Verificar `.env` com URL e anon key; reiniciar `npm run dev` após criar `.env` |

## Additional Notes

- Repositório **single-package** (não é monorepo).
- `tsconfig.json` referencia `tsconfig.app.json` (src) e `tsconfig.node.json` (vite.config.ts).
- Rotas em `src/routes/AppRoutes.tsx`; guards em `src/components/auth/`; sessão em `AuthProvider`.
- Ao implementar o bot: documentar endpoints e contratos em `docs/ESTADO-ATUAL.md`.
