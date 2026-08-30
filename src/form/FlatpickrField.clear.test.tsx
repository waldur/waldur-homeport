import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { FlatpickrField } from './FlatpickrField';

// Drives the real react-flatpickr rather than a stub: the behaviour under test
// is the library's own value syncing, which a mock would define away. That is
// why this lives apart from FlatpickrField.test.tsx, which mocks the library to
// assert prop filtering.
const Harness = () => {
  const [value, setValue] = useState<string | null>('2026-08-21');
  return (
    <FlatpickrField
      input={{
        name: 'date',
        value,
        onChange: setValue,
        onBlur: () => undefined,
        onFocus: () => undefined,
      }}
      options={{ dateFormat: 'Y-m-d' }}
    />
  );
};

describe('FlatpickrField clear button', () => {
  // react-flatpickr skips its sync when the value prop is undefined
  // (`n !== void 0 && ...`), so a cleared field kept the old date on screen
  // while the form already held null.
  it('empties the visible input, not just the form value', async () => {
    render(<Harness />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2026-08-21');

    await userEvent.click(screen.getByRole('button'));

    expect(input).toHaveValue('');
  });
});
