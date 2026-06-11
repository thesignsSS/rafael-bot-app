# AGENTS.md

Instruções para agentes de código que trabalham neste repositório. Formato compatível com [agents.md](https://agents.md/).

## Project Overview

**bot-rafael-app** é um frontend SPA para interface do bot “Rafael”. Auth via **Supabase** (e-mail/senha); rota `/` protegida com formulário de proposta imobiliária e envio HTTP para o servidor do bot.

| Tecnologia | Uso |
|------------|-----|
| React 19 | UI (TSX) |
| TypeScript 5.8 | Tipagem estrita (`strict`) |
| Vite 6 | Dev server, HMR, build |
| Tailwind CSS 4 | Estilos via `@tailwindcss/vite` |
| ESLint 9 + typescript-eslint | Lint em `.ts` / `.tsx` |
| `@supabase/supabase-js` | Auth (sessão, login) |
| `sonner` | Toasts de feedback |

Documentação do projeto:

| Arquivo | Propósito |
|---------|-----------|
| [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) | Estado funcional, rotas, features e decisões de produto |
| [DESIGN.md](DESIGN.md) | Design system: cores, tipografia, layout, componentes |
| `AGENTS.md` (este arquivo) | Convenções para agentes e desenvolvedores |

## Setup Commands

```bash
npm install
```

- Node.js: 20.19+ ou 22.12+.
- Gerenciador de pacotes: **npm** (`package-lock.json` presente).
- Copie `.env.example` → `.env` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_FORM_SUBMISSION_API_URL` e `VITE_FORM_SUBMISSION_API_KEY` (obrigatório para dev com envio ao bot).

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

## UI e design system

Sempre que **criar ou alterar interface** (páginas, layouts, componentes visuais, tokens, estilos globais):

1. **Consulte [DESIGN.md](DESIGN.md) antes de implementar** — cores, tipografia, espaçamento, elevação, formas e padrões de componentes (botões, inputs, cards etc.).
2. **Aplique os tokens** definidos em `src/index.css` (`@theme`), alinhados ao `DESIGN.md`; não invente paleta ou escala tipográfica ad hoc.
3. **Atualize o `DESIGN.md`** quando a implementação introduzir padrão visual novo ou decisão de design que deva valer para o restante do app (ex.: variante de componente, token de cor, regra de layout).

Exceções: lógica pura (hooks, serviços, guards) sem impacto visual não exige consulta ao `DESIGN.md`.

## Documentação do projeto

Ao **finalizar uma implementação** (feature, refatoração relevante, nova convenção ou integração), atualize a documentação com informações e decisões que ajudem quem mantém o código depois. Não encerre a tarefa só com código — a doc faz parte do entregável.

### Quando atualizar

| Situação | O que atualizar |
|----------|-----------------|
| Nova feature, rota ou fluxo de usuário | [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) |
| Mudança de arquitetura, stack, convenções ou comandos | Este `AGENTS.md` **e** [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) |
| Novo padrão visual, token ou componente de UI | [DESIGN.md](DESIGN.md) **e**, se afetar resumo do produto, [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) |
| Nova variável de ambiente | `.env.example`, tipos em `src/vite-env.d.ts`, seções relevantes em `AGENTS.md` e `docs/ESTADO-ATUAL.md` |
| Novo endpoint ou contrato de API | [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md) |

### O que registrar

- **O quê** mudou (comportamento, rotas, permissões, UI).
- **Por quê** (decisão tomada, trade-off, limitação conhecida).
- **Como** usar ou configurar (env vars, SQL de admin, comandos novos).

Mantenha cada arquivo coerente com seu escopo: estado do produto em `ESTADO-ATUAL.md`, design em `DESIGN.md`, instruções operacionais para agentes em `AGENTS.md`. Evite duplicar parágrafos inteiros — prefira links entre os arquivos.

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
  readonly VITE_FORM_SUBMISSION_API_URL?: string
  readonly VITE_FORM_SUBMISSION_API_KEY?: string
}
```

- Não commitar `.env` com segredos; usar `.env.example` quando introduzir env vars.
- `VITE_FORM_SUBMISSION_API_KEY` fica exposta no bundle do browser; em produção, preferir proxy/backend para manter a chave no servidor.

## Pull Request Guidelines

- Mensagens de commit claras (português ou inglês).
- Antes de PR: `npm run lint`, `npm run typecheck` e `npm run build` devem passar.
- Escopo mínimo: não refatorar arquivos não relacionados à tarefa.
- **Documentação:** seguir a seção [Documentação do projeto](#documentação-do-projeto) — incluir atualizações em `docs/ESTADO-ATUAL.md`, `DESIGN.md` e/ou `AGENTS.md` conforme o escopo da mudança.

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
| Badge admin não aparece após SQL | Confirmar `raw_app_meta_data.role = "admin"`; usuário deve logout/login para refrescar JWT |
| Envio ao bot falha | Verificar `VITE_FORM_SUBMISSION_API_URL`, `VITE_FORM_SUBMISSION_API_KEY`, CORS do servidor e se o endpoint `/api/form-submissions` está ativo |

## Additional Notes

- Repositório **single-package** (não é monorepo).
- `tsconfig.json` referencia `tsconfig.app.json` (src) e `tsconfig.node.json` (vite.config.ts).
- Rotas em `src/routes/AppRoutes.tsx`; guards em `src/components/auth/`; sessão em `AuthProvider`.
- Permissionamento: perfil atual carregado de `GET /api/me`; normalização em `src/lib/auth/roles.ts`; guards via `ProtectedRoute` com `allowedRoles` opcional.
- Design system: [DESIGN.md](DESIGN.md); tokens em `src/index.css`.
- Ao implementar o bot: documentar endpoints e contratos em `docs/ESTADO-ATUAL.md`.

## Auth e permissionamento

- Sessão vem do Supabase, mas o frontend usa `GET /api/me?userId=<uuid>` com `x-api-key` para montar o perfil atual usado no layout e nas permissões.
- `src/lib/auth/roles.ts` normaliza roles legadas (`corretor`) para o formato atual (`broker`) quando necessário.
- Promover usuário a admin (Supabase **SQL Editor**; trocar o e-mail):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'seu-email@exemplo.com';
```

- Após alterar metadata, o usuário precisa **logout/login** para refrescar o JWT.
- Documentação completa: [docs/ESTADO-ATUAL.md](docs/ESTADO-ATUAL.md#permissionamento).
