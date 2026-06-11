# Estado atual do bot-rafael-app

Documentação do projeto na versão **0.0.0**. Última revisão: bootstrap de perfil atual via `/api/me`, integração real de propostas com backend, auth Supabase e permissionamento.

## Resumo

| Aspecto | Situação atual |
|---------|----------------|
| **Propósito** | Frontend SPA para interface do bot Rafael; auth com Supabase e cadastro de proposta imobiliária |
| **Stack** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, ESLint 9 |
| **Linguagem** | TypeScript (`.ts` / `.tsx`), modo `strict` |
| **Roteamento** | `react-router-dom`: `/` e `/propostas` protegidas (layout dashboard); `/redefinir-senha` pública (valida token manualmente); `/login`, `/cadastro`, `/recuperar-senha` para convidados |
| **Auth** | Supabase (`signInWithPassword`, `signUp`, `resetPasswordForEmail`, `updateUser`, sessão em localStorage, `AuthProvider`) |
| **Validação** | Zod (`loginSchema`, `signupSchema`, `forgotPasswordSchema`, `resetPasswordSchema`) nos formulários de auth |
| **Design** | Tokens em `src/index.css` (@theme) conforme [DESIGN.md](../DESIGN.md) |
| **Estado global** | `AuthProvider` + `useAuth` (sessão Supabase, `currentUserProfile`, `role`, `isAdmin`, `isCorretor`) |
| **Permissionamento** | perfil atual carregado de `GET /api/me`; guards em `ProtectedRoute` com `allowedRoles` opcional |
| **API / backend** | Supabase Auth (e-mail/senha); API pública do IBGE para municípios do Ceará; endpoints HTTP do bot para perfil atual, criação, listagem e detalhe de propostas; recuperação ainda stub |
| **Testes** | Não configurados |
| **CI/CD** | Não configurado |
| **Variáveis de ambiente** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_FORM_SUBMISSION_API_URL`, `VITE_FORM_SUBMISSION_API_KEY` (ver `.env.example`) |

## Stack e versões instaladas

| Pacote | Papel |
|--------|--------|
| `react` / `react-dom` | UI |
| `react-router-dom` | Rotas SPA + guards |
| `@supabase/supabase-js` | Cliente Supabase Auth |
| `sonner` | Toasts (erros de auth) |
| `zod` | Schemas e validação de formulários |
| `typescript` | Verificação de tipos (`tsc -b`) |
| `vite` | Dev server e build |
| `@vitejs/plugin-react` | Fast Refresh e TSX |
| `tailwindcss` + `@tailwindcss/vite` | Estilos (tokens via `@theme`) |
| `typescript-eslint` | Lint TypeScript |

**Pré-requisito:** Node.js 20.19+ ou 22.12+.

## Estrutura de diretórios

```
bot-rafael-app/
├── .env.example
├── DESIGN.md
├── docs/
│   └── ESTADO-ATUAL.md
├── src/
│   ├── components/
│   │   ├── auth/            # ProtectedRoute, GuestRoute
│   │   ├── dashboard/       # DashboardSidebar, DashboardHeader, SidebarNavItem
│   │   └── ui/              # AuthHeader, Button, Checkbox, TextField, Card, ...
│   ├── contexts/
│   │   ├── AuthProvider.tsx
│   │   └── auth-context.ts
│   ├── hooks/
│   │   ├── useAuthSession.ts
│   │   ├── usePermissionDeniedToast.ts
│   │   └── usePasswordRecoveryAccess.ts
│   ├── lib/
│   │   ├── auth/
│   │   │   └── roles.ts
│   │   └── supabase.ts
│   ├── layouts/
│   │   ├── AuthShell.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/
│   │   ├── home/            # Rota protegida: Nova Proposta
│   │   ├── propostas/       # Listagem e detalhe de propostas via backend
│   │   ├── login/
│   │   ├── cadastro/        # signUp integrado
│   │   ├── recuperar-senha/ # resetPasswordForEmail
│   │   └── redefinir-senha/ # updateUser após link do e-mail
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
└── ...
```

## Fluxo da aplicação

```mermaid
flowchart LR
  indexHtml[index.html] --> mainTsx[main.tsx]
  mainTsx --> router[BrowserRouter]
  router --> app[App AuthProvider]
  app --> loading{isLoading?}
  loading -->|sim| spinner[SessionLoadingScreen]
  loading -->|não| routes[AppRoutes]
  routes --> home["/ home protegida"]
  routes --> propostas["/propostas listagem"]
  routes --> redefinir["/redefinir-senha token manual"]
  routes --> login["/login convidado"]
  routes --> cadastro["/cadastro convidado"]
  routes --> recuperar["/recuperar-senha convidado"]
```

1. `index.html` carrega `/src/main.tsx`.
2. `AuthProvider` resolve sessão via `getSession` + `onAuthStateChange`.
3. Com sessão válida, chama `GET /api/me?userId=<user.id>` com `x-api-key` para reconstruir `currentUserProfile`.
4. Enquanto sessão/perfil carregam, exibe spinner fullscreen.
5. Rotas protegidas (`/`) redirecionam para `/login` sem sessão.
6. Rotas de convidado (`/login`, etc.) redirecionam para `/` se já logado.
7. `/redefinir-senha` valida token manualmente; sem token válido não cria sessão.
8. Login chama `signInWithPassword`; erro → toast genérico em PT; sucesso → `/`.
9. Cadastro chama `signUp` com `user_metadata.full_name`; sessão → `/`; sem sessão → tela de confirmação de e-mail.
10. Recuperação: `resetPasswordForEmail` → e-mail com link Supabase → `/redefinir-senha` (validação manual do token) → `updateUser` → `signOut` → `/login` com toast de sucesso.

## Comportamento da UI atual

### `/` (protegida)

- Tela "Nova Proposta" exibida após login.
- Layout compartilhado (`DashboardLayout`): sidebar com navegação, header com título e logout.
- Formulário de dados do cliente: nome, CPF obrigatório, telefone obrigatório e e-mail obrigatório com validação de formato.
- Formulário de dados do imóvel: tipo (`Novo`/`Usado`) e município obrigatório com busca carregada pela API pública do IBGE.
- Área de documentos adicionais com upload múltiplo, lista de arquivos selecionados e remoção individual antes do envio.
- Campo aberto de informações adicionais com limite de 10.000 caracteres.
- Resumo da proposta atualizado em tela e validação básica antes de enviar.
- Envio converte os anexos para base64 sem prefixo Data URL e faz `POST` para o endpoint do bot configurado em `VITE_FORM_SUBMISSION_API_URL`.
- O submit consulta o usuário autenticado no Supabase no momento do envio e inclui `brokerUserId` (`user.id`) no payload.
- `formData` inclui os campos principais para persistência do cliente: `CPF do Cliente`, `E-mail do Cliente` e `Telefone do Cliente`.
- Arquivos aceitos no envio: `pdf`, `doc`, `docx`, `xls`, `xlsx`, `jpeg`, `jpg`, `png`, `txt`.
- Feedback de envio: botão em loading, toast de sucesso completo quando a API retorna `ok: true` e `savedClient !== false`; aviso quando arquivos foram enviados mas `savedClient === false`; erro amigável para falhas de validação, autorização, endpoint ou servidor.
- Após criação bem-sucedida, redireciona para `/propostas/:proposalId`.

### `/propostas` (protegida)

- Tela "Minhas Propostas" com listagem em tabela (código, corretor, cliente, tipo de imóvel, data e quantidade de documentos).
- Dados consumidos de `GET /api/proposals?brokerUserId=<uuid>&page=<n>&pageSize=10&search=<texto>`.
- Busca por cliente, corretor ou código da proposta via parâmetro `search`; paginação server-side com `page` e `pageSize`.
- Exibe loading, erro, estado vazio e total de itens retornado pelo backend.
- Layout compartilhado via `DashboardLayout` (sidebar com navegação, header com título por rota, footer).
- Botão "Nova Proposta" redireciona para `/`.
- Linhas da tabela navegam para `/propostas/:proposalId`.

### `/propostas/:proposalId` (protegida)

- Consome `GET /api/proposals/:proposalId?brokerUserId=<uuid>`.
- Cabeçalho com código da proposta e corretor.
- Cards de dados do cliente, dados do imóvel e informações adicionais.
- Lista de documentos enviados com nome, tamanho e data de upload.
- Edição da proposta via PATCH; documentos com visualizar, renomear, excluir, upload adicional e baixar tudo em zip.
- Mutações de proposta/documentos fazem refetch do detalhe após sucesso.
- Exibe loading, erro e redireciona para `/propostas` quando a proposta não é encontrada.

### `/login`

- Card central (Proton Enterprise): logo, e-mail, senha, toggle visibilidade.
- Erros de campo em português via Zod (senha mín. 6 caracteres).
- Erro de credenciais: toast "E-mail ou senha incorretos" (sonner).
- E-mail não confirmado: toast "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
- Links para `/recuperar-senha` e `/cadastro`.
- Após redefinir senha: toast "Senha redefinida com sucesso. Faça login com sua nova senha." (via `location.state`).

### `/cadastro`

- Formulário: nome completo, e-mail, senha, confirmar senha, checkbox de termos.
- Validação Zod em português; nome salvo em `user_metadata.full_name`.
- Erro de API: toast genérico "Não foi possível criar a conta. Tente novamente."
- Pós-cadastro: se Supabase retornar sessão → `/`; senão → tela inline "Confirme seu e-mail".
- Link para `/login` ("Já tem uma conta? Entrar").

### `/recuperar-senha`

- Formulário com e-mail; chama `resetPasswordForEmail` com `redirectTo: {origin}/redefinir-senha`.
- Sucesso → tela inline "Verifique seu e-mail" (padrão do cadastro).
- Erro de API → toast genérico "Não foi possível enviar. Tente novamente."
- Redireciona para `/` se o usuário já estiver autenticado (`GuestRoute`).

### `/redefinir-senha` (pública, validação manual)

- Rota fora de `ProtectedRoute`/`GuestRoute`; sessão **não** é criada automaticamente pela URL (`detectSessionInUrl: false`).
- Hook valida token da URL (`setSession` no hash ou `verifyOtp` na query); link inválido/expirado → `signOut` + redirect `/recuperar-senha`.
- Link válido → sessão temporária de recovery (necessária para `updateUser`) + formulário nova senha + confirmar (Zod).
- Sucesso → `signOut` → `/login` com toast. Refresh durante o fluxo via flag em `sessionStorage`.

## Configuração Supabase (recuperação de senha)

No Dashboard → **Authentication**:

| Campo | Valor dev |
|-------|-----------|
| **Site URL** | `http://localhost:5173` |
| **Redirect URLs** | `http://localhost:5173/redefinir-senha` |

**Email Templates → Reset password:** o link deve usar `href="{{ .ConfirmationURL }}"` (fluxo implicit para SPA). Alternativa: `href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery"` (exige `verifyOtp` no hook — já implementado).

Referências: [Password-based Auth](https://supabase.com/docs/guides/auth/passwords#resetting-a-password), [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates).

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_FORM_SUBMISSION_API_URL=http://localhost:3335/api/form-submissions
VITE_FORM_SUBMISSION_API_KEY=sua-api-key-do-bot
```

No Supabase Dashboard: **Authentication → Providers → Email** habilitado.

## Contrato do perfil atual

O frontend chama `GET /api/me?userId=<uuid>` logo após restaurar a sessão Supabase, no refresh da página e sempre que precisa reconstruir o estado global de autorização.

Headers:

```http
x-api-key: <VITE_FORM_SUBMISSION_API_KEY>
```

Shape usado no estado global:

```ts
type CurrentUserProfile = {
  id: string
  fullName: string
  role: 'admin' | 'broker'
  isAdmin: boolean
}
```

Se o backend responder "Perfil não encontrado", o frontend aplica fallback local com os dados do usuário autenticado para não quebrar a UI.

## Contrato de envio ao bot

O frontend envia `POST` para `VITE_FORM_SUBMISSION_API_URL` com `Authorization: Bearer VITE_FORM_SUBMISSION_API_KEY`.

Payload esperado:

```json
{
  "brokerUserId": "uuid-do-auth-user",
  "brokerName": "Nome do corretor",
  "clientName": "Nome do cliente",
  "formData": {
    "Nome do Cliente Completo": "Nome do cliente",
    "CPF do Cliente": "07050796352",
    "E-mail do Cliente": "cliente@email.com",
    "Telefone do Cliente": "85999999999",
    "Tipo do Imóvel": "Novo",
    "Município do Imóvel": "Fortaleza",
    "UF do Imóvel": "CE",
    "Informações Adicionais": "texto livre"
  },
  "documents": [
    {
      "filename": "rg.pdf",
      "contentBase64": "..."
    }
  ]
}
```

Resposta esperada: `ok: true`, `proposalId`, `proposalCode` e `savedClient` indicando se o cliente foi persistido em `public.broker_clients`. Quando `savedClient === false`, o frontend exibe aviso de envio parcial; quando há `proposalId`, navega para o detalhe da proposta.

Listagem:

```http
GET /api/proposals?brokerUserId=<uuid>&page=1&pageSize=10&search=texto
```

Detalhe:

```http
GET /api/proposals/:proposalId?brokerUserId=<uuid>
```

Edição da proposta:

```http
PATCH /api/proposals/:proposalId
```

Payload: `brokerUserId`, dados do cliente, dados do imóvel, `additionalInfo` e `formData` atualizado.

Documentos:

| Ação | Endpoint |
|------|----------|
| Upload adicional | `POST /api/proposals/:proposalId/documents` |
| Renomear | `PATCH /api/proposals/:proposalId/documents/:documentId` |
| Excluir | `DELETE /api/proposals/:proposalId/documents/:documentId?brokerUserId=<uuid>` |
| Visualizar | `GET /api/proposals/:proposalId/documents/:documentId/view?brokerUserId=<uuid>` |
| Baixar zip | `GET /api/proposals/:proposalId/download?brokerUserId=<uuid>` |

Após editar, enviar, renomear ou excluir documentos, o frontend faz refetch do detalhe para refletir o estado persistido.

## Permissionamento

### Perfis e fonte da verdade

| Perfil | Valor retornado em `/api/me` | Comportamento padrão |
|--------|------------------------------|----------------------|
| Corretor | `broker` | Visão padrão de corretor |
| Administrador | `admin` | Visão administrativa |

Lógica pura em `src/lib/auth/roles.ts`: `parseUserRole`, `hasRouteAccess`, helpers `isAdminRole` / `isCorretorRole`. O parser também entende `corretor` como alias legado para compatibilidade com dados antigos.

O contexto de auth expõe `currentUserProfile`, `role`, `isAdmin`, `isCorretor`, `profileError` e `refreshProfile` via `useAuth()`.

### Proteção de rotas (`ProtectedRoute`)

Um único guard cobre autenticação e restrição por grupo:

| Cenário | Configuração | Quem acessa |
|---------|--------------|-------------|
| Só autenticação | `<ProtectedRoute />` | Qualquer usuário logado |
| Só admin | `<ProtectedRoute allowedRoles={['admin']} />` | Administradores |
| Só corretor | `<ProtectedRoute allowedRoles={['broker']} />` | Corretores |
| Vários grupos | `<ProtectedRoute allowedRoles={['admin', 'broker']} />` | União dos grupos |
| Grupo futuro | Estender `UserRole` em `roles.ts` + `allowedRoles` na rota | Conforme definido |

Acesso negado por role: redirect para `/` com toast "Sem permissão" (`usePermissionDeniedToast` no dashboard).

Exemplos comentados em `src/routes/AppRoutes.tsx`. Rotas `/admin/*` ainda não existem.

**Fase 2:** itens de sidebar/nav devem usar `hasRouteAccess` para ocultar links inacessíveis.

### Escopo de propostas

- O frontend envia `brokerUserId` (`user.id`) nas consultas de listagem e detalhe.
- O backend é a fonte de verdade para filtrar propostas por usuário e permissões.
- O layout usa `currentUserProfile` para montar visão de corretor ou administrador no bootstrap e após refresh.
- Badge "Administrador" no header quando `isAdmin`; regras de dados devem continuar protegidas no backend.

### Promover usuário a admin

No Supabase Dashboard → **Authentication → Users** → selecionar usuário → **Edit** → **App Metadata**:

```json
{ "role": "admin" }
```

### Trigger: role padrão no signup

Rodar no SQL Editor do Supabase para definir `corretor` em todo cadastro novo:

```sql
CREATE OR REPLACE FUNCTION public.set_default_user_role()
RETURNS trigger AS $$
BEGIN
  NEW.raw_app_meta_data =
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', 'corretor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_set_role
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_default_user_role();
```

### Adicionar novo grupo (ex.: `supervisor`)

1. Incluir o valor em `KNOWN_ROLES` / `UserRole` em `src/lib/auth/roles.ts`.
2. Atribuir `app_metadata.role` no Supabase (manual ou trigger).
3. Proteger rotas com `<ProtectedRoute allowedRoles={['supervisor']} />`.

### Segurança

Guards de rota são **UX no frontend**. Ao integrar dados reais, reforçar permissões com RLS/policies no Supabase — o cliente não deve ser a única barreira.

> Segurança: `VITE_FORM_SUBMISSION_API_KEY` fica exposta no bundle do browser. Em produção, usar uma rota backend/proxy para chamar o servidor do bot com a chave somente no servidor.

## O que ainda não existe

- Rota dedicada de confirmação de e-mail
- Links reais para Termos de Uso / Política de Privacidade
- Rotas `/admin/*` e gestão de usuários
- Proxy backend para manter a API key do bot fora do bundle em produção
- Testes (Vitest)

## Próximos passos sugeridos

1. Proxy backend para envio ao bot sem expor API key no browser.
2. Vitest + React Testing Library.

## Referências

- [README.md](../README.md)
- [AGENTS.md](../AGENTS.md)
- [DESIGN.md](../DESIGN.md)
