export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}
