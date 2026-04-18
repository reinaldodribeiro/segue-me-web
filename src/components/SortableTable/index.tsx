'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { SortableTableProps } from './types';

function SortableTable<T>({
  columns,
  rows,
  rowKey,
  sortBy: controlledSortBy,
  sortDir: controlledSortDir,
  onSort,
  getValue,
  defaultSortKey,
  defaultSortDir = 'asc',
}: SortableTableProps<T>) {
  const isControlled = typeof onSort === 'function';

  /* ── Internal state (uncontrolled / client-side) ── */
  const [internalKey, setInternalKey] = useState<string | undefined>(defaultSortKey);
  const [internalDir, setInternalDir] = useState<'asc' | 'desc'>(defaultSortDir);

  const activeSortKey = isControlled ? controlledSortBy : internalKey;
  const activeSortDir = isControlled ? (controlledSortDir ?? 'asc') : internalDir;

  function handleHeaderClick(sortKey: string) {
    const nextDir: 'asc' | 'desc' =
      activeSortKey === sortKey ? (activeSortDir === 'asc' ? 'desc' : 'asc') : 'asc';

    if (isControlled) {
      onSort!(sortKey, nextDir);
    } else {
      setInternalKey(sortKey);
      setInternalDir(nextDir);
    }
  }

  /* ── Client-side sort ── */
  const displayRows = (() => {
    if (isControlled || !activeSortKey || !getValue) return rows;

    return [...rows].sort((a, b) => {
      const va = getValue(a, activeSortKey) ?? '';
      const vb = getValue(b, activeSortKey) ?? '';
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' });
      }
      return activeSortDir === 'desc' ? -cmp : cmp;
    });
  })();

  /* ── Sort icon helper ── */
  function SortIcon({ sortKey }: { sortKey: string }) {
    if (activeSortKey !== sortKey) return <ArrowUpDown size={13} className="opacity-40" />;
    return activeSortDir === 'asc'
      ? <ArrowUp size={13} />
      : <ArrowDown size={13} />;
  }

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-border bg-hover/30">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 text-left font-semibold text-text-muted ${col.headerClassName ?? ''}`}
            >
              {col.sortKey ? (
                <button
                  onClick={() => handleHeaderClick(col.sortKey!)}
                  className="inline-flex items-center gap-1 hover:text-text transition-colors"
                >
                  {col.header}
                  <SortIcon sortKey={col.sortKey} />
                </button>
              ) : (
                col.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {displayRows.map((row, i) => (
          <tr key={rowKey(row)} className="hover:bg-hover/40 transition-colors">
            {columns.map((col) => (
              <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                {col.cell(row, i)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default SortableTable;
