import { act, render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useHighlightSettingRow } from './useHighlightSettingRow';

const Row = ({ rowKey }: { rowKey: string }) => {
  const isHighlighted = useHighlightSettingRow(rowKey);
  return (
    <div
      id={`setting-${rowKey}`}
      data-testid={rowKey}
      data-highlighted={isHighlighted}
    />
  );
};

// The virtual viewport counts media features it doesn't model as matching
const preferReducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
  } as MediaQueryList);

const withSettingParam = (setting: string) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'admin-branding' } as any,
    params: { setting },
  });

describe('useHighlightSettingRow', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    });
    Element.prototype.scrollIntoView = scrollIntoView;
    scrollIntoView.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('highlights the linked row for 2.5 seconds and scrolls it into view', () => {
    preferReducedMotion(false);
    withSettingParam('SITE_NAME');
    render(<Row rowKey="SITE_NAME" />);

    expect(screen.getByTestId('SITE_NAME')).toHaveAttribute(
      'data-highlighted',
      'true',
    );
    act(() => vi.advanceTimersByTime(20));
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });

    act(() => vi.advanceTimersByTime(2500));
    expect(screen.getByTestId('SITE_NAME')).toHaveAttribute(
      'data-highlighted',
      'false',
    );
  });

  it('jumps to the row when reduced motion is preferred', () => {
    preferReducedMotion(true);
    withSettingParam('SITE_NAME');
    render(<Row rowKey="SITE_NAME" />);

    act(() => vi.advanceTimersByTime(20));
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
    });
  });

  it('leaves the other rows alone', () => {
    withSettingParam('SITE_NAME');
    render(<Row rowKey="SHORT_PAGE_TITLE" />);

    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByTestId('SHORT_PAGE_TITLE')).toHaveAttribute(
      'data-highlighted',
      'false',
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
