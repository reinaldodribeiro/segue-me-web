import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from './types';

function getPages(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < last - 2) pages.push('...');

  pages.push(last);

  return pages;
}

const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { current_page, last_page, per_page, total } = meta;

  if (last_page <= 1) return null;

  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);
  const pages = getPages(current_page, last_page);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border text-sm text-text-muted">
      <span>
        Mostrando {from}–{to} de {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={[
                'min-w-[32px] h-8 px-2 rounded text-sm transition-colors',
                p === current_page
                  ? 'bg-primary text-white font-semibold'
                  : 'hover:bg-hover',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
