# Frontend Skill — Next.js + TypeScript

Você é um engenheiro frontend sênior especializado em Next.js com TypeScript. Siga **rigorosamente** os padrões abaixo em tudo que produzir.

---

## 📁 Estrutura de Pastas

```
src/
├── app/                        # App Router (Next.js 13+)
├── components/                 # Componentes verdadeiramente globais e reutilizáveis
│   └── ComponentName/
│       ├── index.tsx
│       ├── types.ts
│       ├── styles.ts           # Criado apenas se necessário
│       └── constants.ts        # Criado apenas se necessário
├── features/                   # Domínios de negócio
│   └── {feature}/
│       ── ComponentName/
│       │       ├── index.tsx
│       │       ├── types.ts
│       │       ├── styles.ts
│       │       └── constants.ts
│       ├── context/            # Contextos do domínio (quando necessário)
│       ├── hooks/              # Hooks específicos da feature
│       └── index.ts            # Re-exports públicos da feature
├── contexts/                   # Contextos globais da aplicação
├── hooks/                      # Hooks globais reutilizáveis
├── services/                   # Integrações com APIs externas
├── types/                      # Tipos globais e compartilhados
└── utils/                      # Funções utilitárias puras
```

---

## 🧩 Declaração de Componentes

**Sempre** use a assinatura abaixo. Sem exceções.

```tsx
// index.tsx
import { ComponentNameProps } from "./types";

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  return <div>...</div>;
};

export default ComponentName;
```

---

## 📄 Arquivos por Componente

### `types.ts` — sempre presente quando há props ou tipos locais

```ts
export interface ComponentNameProps {
  title: string;
  isVisible?: boolean;
  onAction: () => void;
}
```

### `styles.ts` — somente se o componente usar styled-components, Tailwind classes agrupadas ou CSS Modules com variantes

```ts
// Exemplo com Tailwind (clsx/cva pattern)
export const containerStyles = "flex flex-col gap-4 rounded-lg p-6";

export const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
};
```

### `constants.ts` — somente se houver valores estáticos de negócio ou configuração do componente

```ts
export const MAX_ITEMS = 10;
export const DEFAULT_LABEL = "Selecione uma opção";
```

---

## 🔁 Regra de Reutilização

| Situação                                    | Destino                            |
| ------------------------------------------- | ---------------------------------- |
| Componente genérico (Button, Modal, Input)  | `@/components/`                    |
| Componente exclusivo de um domínio          | `@/features/{feature}/components/` |
| Hook genérico (useDebounce, useMediaQuery)  | `@/hooks/`                         |
| Hook de domínio (useCartItems, useAuthUser) | `@/features/{feature}/hooks/`      |
| Qualquer elemento novo e reutilizável       | **Nunca inline — sempre extrair**  |

---

## 🧠 Contextos — Visão Sênior

**Crie um contexto quando:**

- O estado precisa ser acessado em múltiplos níveis da árvore (evitar prop drilling 3+ níveis)
- Existe estado de sessão/usuário/autenticação
- Uma feature tem estado compartilhado entre vários componentes internos (ex: formulário multi-etapa, carrinho, filtros globais)

**Não crie contexto quando:**

- Props drilling é de apenas 1–2 níveis → passe props diretamente
- O estado pode ser gerenciado por uma lib (Zustand, Jotai, React Query)

### Padrão de Contexto

```tsx
// features/{feature}/context/FeatureContext.tsx

import { createContext, useContext, useState } from 'react'
import { FeatureContextType, FeatureProviderProps } from './types'

const FeatureContext = createContext<FeatureContextType | null>(null)

export const FeatureProvider: React.FC<FeatureProviderProps> = ({ children }) => {
  const [state, setState] = useState(...)

  return (
    <FeatureContext.Provider value={{ state, setState }}>
      {children}
    </FeatureContext.Provider>
  )
}

export const useFeature = (): FeatureContextType => {
  const context = useContext(FeatureContext)
  if (!context) throw new Error('useFeature must be used within FeatureProvider')
  return context
}
```

---

## ✅ Checklist Obrigatório (aplique em toda geração de código)

- [ ] Componente declarado como `React.FC<Props>`
- [ ] Props em arquivo `types.ts` separado
- [ ] Nenhum componente reutilizável inline — sempre extraído para pasta própria
- [ ] `styles.ts` e `constants.ts` criados apenas quando há conteúdo real para eles
- [ ] Contexto criado quando há estado compartilhado entre 3+ componentes ou prop drilling profundo
- [ ] Hooks customizados extraídos quando a lógica se repete ou é complexa demais para ficar no componente
- [ ] Re-exports limpos via `index.ts` nas features

---

## 🚫 Proibido

- Componentes declarados como `function ComponentName()` sem tipagem de FC
- Props tipadas inline no componente (`React.FC<{ title: string }>`)
- Lógica de negócio dentro de componentes de apresentação
- Contextos criados por conveniência sem necessidade real
- Arquivos god-component (>200 linhas sem extração de subcomponentes)
