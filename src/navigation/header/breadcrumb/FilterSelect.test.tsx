import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FilterSelect } from './FilterSelect';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

const renderSelect = (value) => (
  <FilterSelect
    input={{ value, onChange: () => {} }}
    options={options}
    placeholder="State"
  />
);

describe('FilterSelect', () => {
  it('shows the placeholder and the number of selected values', () => {
    render(renderSelect([options[0], options[1]]));

    expect(screen.getByText(/State \(2\)/)).toBeInTheDocument();
  });

  it('keeps the input mounted when the first value is selected or the last removed', () => {
    const { rerender } = render(renderSelect([]));
    const input = screen.getByRole('combobox');

    rerender(renderSelect([options[0]]));
    expect(screen.getByRole('combobox')).toBe(input);

    rerender(renderSelect([]));
    expect(screen.getByRole('combobox')).toBe(input);
  });
});
