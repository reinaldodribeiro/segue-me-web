export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  /**
   * When provided the column header becomes a sort button.
   * - Controlled mode (onSort passed): the key is forwarded to onSort.
   * - Uncontrolled mode (no onSort): the key is passed to getValue to obtain
   *   a comparable primitive for client-side sorting.
   */
  sortKey?: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface SortableTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;

  /* ── Controlled (server-side) sort ── */
  /** Current sort column key (controlled). When provided, component is controlled. */
  sortBy?: string;
  /** Current sort direction (controlled). */
  sortDir?: 'asc' | 'desc';
  /** Called when user clicks a sortable column header (controlled mode). */
  onSort?: (key: string, dir: 'asc' | 'desc') => void;

  /* ── Uncontrolled (client-side) sort ── */
  /**
   * Returns the comparable value for a row given a sortKey.
   * Required when using client-side sort (no onSort).
   * Return a number for numeric/date comparison, string for lexicographic.
   */
  getValue?: (row: T, sortKey: string) => string | number | null | undefined;
  /** Initial sort column in uncontrolled mode. */
  defaultSortKey?: string;
  /** Initial sort direction in uncontrolled mode. Default: 'asc'. */
  defaultSortDir?: 'asc' | 'desc';
}
