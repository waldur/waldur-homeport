import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RestrictionTagsField } from './RestrictionTagsField';

const renderField = (
  value: string[],
  options?: { value: string; label: string }[],
) => {
  const onChange = vi.fn();
  renderWithProviders(
    <RestrictionTagsField
      input={
        { name: 'user_affiliations', value, onChange, onBlur: vi.fn() } as any
      }
      options={options}
    />,
  );
  return onChange;
};

describe('RestrictionTagsField', () => {
  it('labels a stored value the vocabulary knows', () => {
    renderField(['faculty'], [{ value: 'faculty', label: 'Faculty' }]);

    expect(screen.getByText('Faculty')).toBeInTheDocument();
  });

  // Dropping unknown values would quietly rewrite a call's restrictions on the
  // next save, because react-select renders only what it finds in `options`.
  it('keeps a stored value the vocabulary does not know', () => {
    renderField(['faculty@ut.ee'], [{ value: 'faculty', label: 'Faculty' }]);

    expect(screen.getByText('faculty@ut.ee')).toBeInTheDocument();
  });

  it('emits plain strings, not option objects', async () => {
    const user = userEvent.setup();
    const onChange = renderField([], [{ value: 'staff', label: 'Staff' }]);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Staff' }));

    expect(onChange).toHaveBeenCalledWith(['staff']);
  });
});
