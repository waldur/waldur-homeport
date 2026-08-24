import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CommaSeparatedListField } from './CommaSeparatedListField';

const createMockInput = (value: string[] = [], onChange = vi.fn()) => ({
  name: 'emails',
  value,
  onChange,
  onBlur: vi.fn(),
});

/** Mirrors how react-final-form feeds the edited value back into the control. */
const ControlledField = ({ initial = [] as string[], onValue }) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <CommaSeparatedListField
      input={
        {
          name: 'emails',
          value,
          onChange: (next: string[]) => {
            setValue(next);
            onValue(next);
          },
          onBlur: vi.fn(),
        } as any
      }
      meta={{} as any}
    />
  );
};

describe('CommaSeparatedListField', () => {
  it('renders the stored list as separated text', () => {
    const mockInput = createMockInput(['a@example.com', 'b@example.com']);
    render(
      <CommaSeparatedListField input={mockInput as any} meta={{} as any} />,
    );

    expect(screen.getByRole('textbox')).toHaveValue(
      'a@example.com, b@example.com',
    );
  });

  it('emits an array of trimmed entries as the user types', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledField onValue={onValue} />);

    await user.type(
      screen.getByRole('textbox'),
      'a@example.com, b@example.com',
    );

    expect(onValue).toHaveBeenLastCalledWith([
      'a@example.com',
      'b@example.com',
    ]);
  });

  it('keeps a half-typed separator on screen without emitting a blank entry', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledField onValue={onValue} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a@example.com, ');

    // The trailing separator must survive so the user can keep typing...
    expect(input).toHaveValue('a@example.com, ');
    // ...but it must not reach the API as an empty list member.
    expect(onValue).toHaveBeenLastCalledWith(['a@example.com']);
  });

  it('emits an empty array — not [""] — when the field is cleared', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledField initial={['a@example.com']} onValue={onValue} />);

    const input = screen.getByRole('textbox');
    await user.clear(input);

    // Emitted on change, so a submit that never blurs the input (Enter inside
    // a dialog) still sends a well-formed payload.
    expect(onValue).toHaveBeenLastCalledWith([]);
  });

  it('re-renders from the cleaned value on blur', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledField onValue={onValue} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a@example.com,,');
    await user.tab();

    expect(input).toHaveValue('a@example.com');
  });
});
