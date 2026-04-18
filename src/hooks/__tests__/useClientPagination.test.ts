import { renderHook, act } from '@testing-library/react';
import { useClientPagination } from '../useClientPagination';

const ITEMS_25 = Array.from({ length: 25 }, (_, i) => i + 1);

describe('useClientPagination', () => {
  it('default perPage=10: first page returns items 1-10', () => {
    const { result } = renderHook(() => useClientPagination(ITEMS_25));
    expect(result.current.paginated).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.meta.total).toBe(25);
    expect(result.current.meta.last_page).toBe(3);
    expect(result.current.meta.current_page).toBe(1);
  });

  it('page 2 returns items 11-20', () => {
    const { result } = renderHook(() => useClientPagination(ITEMS_25));
    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.paginated).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.current.meta.current_page).toBe(2);
  });

  it('page 3 returns items 21-25', () => {
    const { result } = renderHook(() => useClientPagination(ITEMS_25));
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.paginated).toEqual([21, 22, 23, 24, 25]);
  });

  it('custom perPage=5 returns items 1-5 with last_page=5', () => {
    const { result } = renderHook(() =>
      useClientPagination(ITEMS_25, [], { perPage: 5 }),
    );
    expect(result.current.paginated).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.meta.last_page).toBe(5);
  });

  it('empty array yields empty paginated with total=0 and last_page=1', () => {
    const { result } = renderHook(() => useClientPagination([]));
    expect(result.current.paginated).toEqual([]);
    expect(result.current.meta.total).toBe(0);
    expect(result.current.meta.last_page).toBe(1);
    expect(result.current.meta.current_page).toBe(1);
  });

  it('clamps page when items shrink', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useClientPagination(items),
      { initialProps: { items: ITEMS_25 } },
    );

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.meta.current_page).toBe(3);

    // Re-render with only 5 items — page 3 does not exist, should clamp to 1
    rerender({ items: [1, 2, 3, 4, 5] });
    expect(result.current.meta.current_page).toBe(1);
  });

  it('deps reset: changing a dep resets page to 1', () => {
    const { result, rerender } = renderHook(
      ({ search }) => useClientPagination(ITEMS_25, [search]),
      { initialProps: { search: '' } },
    );

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.meta.current_page).toBe(2);

    // Changing search dep triggers reset to page 1
    act(() => {
      rerender({ search: 'new query' });
    });
    expect(result.current.meta.current_page).toBe(1);
  });
});
