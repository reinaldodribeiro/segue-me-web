import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 400));
    expect(result.current).toBe('initial');
  });

  it('stays at initial value when timer has not fired yet', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'updated' });
    jest.advanceTimersByTime(200);

    expect(result.current).toBe('initial');
  });

  it('updates to new value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'updated' });
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'first' } },
    );

    // Advance 200ms, then change value
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'second' });

    // Advance another 200ms — timer should NOT have fired (reset happened)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    // Advance the remaining 200ms to complete the new 400ms delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second');
  });

  it('supports custom delay parameter', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'start' } },
    );

    rerender({ value: 'end' });
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(result.current).toBe('start');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('end');
  });
});
