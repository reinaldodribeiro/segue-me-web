import type { FunctionComponent, ReactNode } from 'react';

declare global {
  type SafeFC<P = {}> = FunctionComponent<P & { children?: ReactNode }>;
}

export {};
