import '@testing-library/jest-dom';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Select, AsyncSelect, useSelect } from '.';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

describe('Select component', () => {
  it('renders options with selected value at top when menu opens', async () => {
    render(
      <Select
        variant="tableFilter"
        options={options}
        value={{ value: 'b', label: 'B' }}
        onBlur={() => {}}
      />,
    );

    await waitFor(() => {
      const renderedOptions = screen.getAllByRole('option');
      expect(renderedOptions.length).toBe(3);
      expect(renderedOptions[0]).toHaveTextContent('B');
    });
  });

  it('renders multi-select with selected values at top when menu opens', async () => {
    const selectedValues = [
      { value: 'c', label: 'C' },
      { value: 'a', label: 'A' },
    ];

    render(
      <Select
        variant="tableFilter"
        isMulti
        options={options}
        value={selectedValues}
        onBlur={() => {}}
      />,
    );

    await waitFor(() => {
      const renderedOptions = screen.getAllByRole('option');
      expect(renderedOptions.length).toBe(3);
      expect(renderedOptions[0]).toHaveTextContent('A');
      expect(renderedOptions[1]).toHaveTextContent('C');
      expect(renderedOptions[2]).toHaveTextContent('B');
    });
  });
});

describe('AsyncSelect component', () => {
  it('renders async options with selected value at top on first page', async () => {
    const mockLoadOptions = vi.fn().mockResolvedValue({
      options,
      hasMore: false,
    });

    render(
      <AsyncSelect
        variant="tableFilter"
        loadOptions={mockLoadOptions}
        value={{ value: 'b', label: 'B' }}
      />,
    );

    await waitFor(() => {
      const renderedOptions = screen.getAllByRole('option');
      expect(renderedOptions.length).toBe(3);
      expect(renderedOptions[0]).toHaveTextContent('B');
    });

    expect(mockLoadOptions).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ page: 1 }),
    );
  });

  it('renders selected values at top even if selected option is from next page in async multi-select', async () => {
    const selectedValues = [
      { value: 'c', label: 'C' },
      { value: 'd', label: 'D' }, // Assume opt D is in page 2
    ];

    const mockLoadOptions = vi
      .fn()
      .mockResolvedValueOnce({
        options: options,
        hasMore: true,
        additional: { page: 2 },
      })
      .mockResolvedValue({
        options: [],
        hasMore: false,
      });

    render(
      <AsyncSelect
        variant="tableFilter"
        isMulti
        loadOptions={mockLoadOptions}
        value={selectedValues}
      />,
    );

    await waitFor(() => {
      const renderedOptions = screen.getAllByRole('option');
      // selected values C and D should be at the top
      expect(renderedOptions.length).toBe(4);
      expect(renderedOptions[0]).toHaveTextContent('C');
      expect(renderedOptions[1]).toHaveTextContent('D');
      expect(renderedOptions[2]).toHaveTextContent('A');
      expect(renderedOptions[3]).toHaveTextContent('B');
    });
  });
});

describe('useSelect — portaling defaults', () => {
  // The portal styles carry the z-index and the `pointer-events: auto` that
  // keeps a menu clickable inside the modal drawer (src/drawer). A caller's
  // own `styles` is merged with them, because replacing them would break that
  // far from the call site — so assert composition, not just presence.
  const menuList = (base: object) => ({ ...base, height: '99px' });

  it('keeps the portal styles when a caller passes its own', () => {
    const { result } = renderHook(() =>
      useSelect({ options, styles: { menuList } }),
    );
    expect(result.current.styles.menuList).toBe(menuList);
    expect(result.current.styles.menuPortal({})).toEqual({
      zIndex: 9999,
      pointerEvents: 'auto',
    });
  });

  it('lets a caller override one style key without dropping the others', () => {
    const menuPortal = (base: object) => ({ ...base, zIndex: 1 });
    const { result } = renderHook(() =>
      useSelect({ options, styles: { menuPortal } }),
    );
    expect(result.current.styles.menuPortal).toBe(menuPortal);
    expect(result.current.maxMenuHeight).toBe(260);
    expect(result.current.menuPortalTarget).toBe(document.body);
  });

  it('keeps the table filter height alongside the portal styles', () => {
    const { result } = renderHook(() =>
      // `value: null` skips the selected-first reordering, which a table
      // filter's always-open menu would otherwise run on mount.
      useSelect({ options, variant: 'tableFilter', value: null }),
    );
    expect(result.current.styles.menuList({})).toEqual({ height: '175px' });
    expect(result.current.styles.menuPortal({})).toEqual({
      zIndex: 9999,
      pointerEvents: 'auto',
    });
    // ...but it renders inline, so nothing portals and those styles never apply.
    expect(result.current.menuPortalTarget).toBeUndefined();
  });
});
