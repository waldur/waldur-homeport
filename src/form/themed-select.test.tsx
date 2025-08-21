import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
  REACT_MULTI_SELECT_TABLE_FILTER,
} from './themed-select';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

describe('Select component', () => {
  it('renders options with selected value at top when menu opens', async () => {
    render(
      <Select
        {...REACT_SELECT_TABLE_FILTER}
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
        {...REACT_MULTI_SELECT_TABLE_FILTER}
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

describe('AsyncPaginate component', () => {
  it('renders async options with selected value at top on first page', async () => {
    const mockLoadOptions = vi.fn().mockResolvedValue({
      options,
      hasMore: false,
    });

    render(
      <AsyncPaginate
        {...REACT_SELECT_TABLE_FILTER}
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

    const mockLoadOptions = vi.fn().mockResolvedValueOnce({
      options: options,
      hasMore: true,
    });

    render(
      <AsyncPaginate
        {...REACT_MULTI_SELECT_TABLE_FILTER}
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
