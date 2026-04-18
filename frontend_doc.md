# Sistema de Encontros Paroquiais — Frontend
### Documento Técnico de Desenvolvimento

---

## VISÃO GERAL

Aplicação web em Next.js 14 com App Router que consome a API REST do backend Laravel. Interface responsiva, com suporte a personalização visual por paróquia (logo e cores). Autenticação via tokens Sanctum armazenados em cookie httpOnly.

---

## STACK

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript 5 (strict mode) |
| Estilização | Tailwind CSS 3 + CSS Variables |
| Componentes | shadcn/ui |
| Estado Servidor | TanStack Query v5 |
| Estado Global | Zustand |
| Formulários | React Hook Form + Zod |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| HTTP Client | Axios (instância configurada) |
| Ícones | Lucide React |
| Tabelas | TanStack Table v8 |
| Notificações | Sonner |
| Testes | Vitest + Testing Library |

---

## ESTRUTURA DE PASTAS

```
src/
├── app/                          ← App Router (Next.js)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← layout autenticado com sidebar
│   │   ├── people/
│   │   │   ├── page.tsx          ← listagem
│   │   │   ├── [id]/page.tsx     ← perfil
│   │   │   └── new/page.tsx      ← cadastro
│   │   ├── encounters/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx     ← detalhe + montagem de equipes
│   │   │   └── new/page.tsx
│   │   ├── movements/
│   │   └── reports/
│   └── layout.tsx                ← root layout (fontes, providers)
│
├── components/
│   ├── ui/                       ← shadcn/ui (gerados, não editar)
│   ├── common/                   ← componentes reutilizáveis
│   │   ├── PageHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FileUpload.tsx
│   │   └── ConfirmDialog.tsx
│   ├── people/
│   │   ├── PersonCard.tsx        ← card com foto + nome + skills
│   │   ├── PersonForm.tsx
│   │   ├── PersonHistory.tsx
│   │   └── ImportModal.tsx
│   ├── encounter/
│   │   ├── EncounterSummary.tsx
│   │   ├── TeamBoard.tsx         ← drag & drop principal
│   │   ├── TeamColumn.tsx
│   │   ├── PersonDraggable.tsx
│   │   └── AutoAssembleButton.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── ParishThe