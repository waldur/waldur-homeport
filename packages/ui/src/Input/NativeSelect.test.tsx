import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NativeSelect } from './NativeSelect';

const options = (
  <>
    <option value="a">Alpha</option>
    <option value="b">Beta</option>
  </>
);

describe('NativeSelect', () => {
  it('is a native select and forwards its ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <NativeSelect ref={ref} aria-label="Letter">
        {options}
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox', { name: 'Letter' });
    expect(select.tagName).toBe('SELECT');
    expect(ref.current).toBe(select);
  });

  it('reports the chosen option', async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Letter" onChange={onChange}>
        {options}
      </NativeSelect>,
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('b');
  });

  it('draws the caret as an icon, not a background image', () => {
    render(<NativeSelect aria-label="Letter">{options}</NativeSelect>);
    expect(screen.getByTestId('CaretDownIcon')).toBeInTheDocument();
  });

  it('maps invalid to aria-invalid and shows the warning icon', () => {
    render(
      <NativeSelect aria-label="Letter" invalid>
        {options}
      </NativeSelect>,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByTestId('WarningCircleIcon')).toBeInTheDocument();
  });

  it('does not change when disabled', async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Letter" disabled onChange={onChange}>
        {options}
      </NativeSelect>,
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the caret clear of the text at every size', () => {
    const { rerender } = render(
      <NativeSelect aria-label="Letter" size="lg">
        {options}
      </NativeSelect>,
    );
    expect(screen.getByRole('combobox')).toHaveClass(
      'pr-[calc(12px+var(--input-end,0px))]',
    );
    rerender(
      <NativeSelect aria-label="Letter" size="sm">
        {options}
      </NativeSelect>,
    );
    expect(screen.getByRole('combobox')).toHaveClass(
      'pr-[calc(12px+var(--input-end,0px))]',
    );
  });

  it('sends layout classes to the wrapper and the rest to the select', () => {
    render(
      <NativeSelect
        aria-label="Letter"
        fit
        containerClassName="mb-1.5"
        className="font-medium"
      >
        {options}
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('font-medium', 'w-auto');
    // eslint-disable-next-line testing-library/no-node-access -- the wrapper is what carries the layout classes
    expect(select.parentElement).toHaveClass('mb-1.5', 'w-fit');
  });
});
