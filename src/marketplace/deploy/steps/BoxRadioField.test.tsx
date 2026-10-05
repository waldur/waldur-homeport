import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BoxRadioField } from './BoxRadioField';

/**
 * Regression coverage for the Radix conversion: the version-options
 * flyout (each choice with `options`) used to be a Metronic-driven
 * dropdown nested inside a <button> — a real dropdown <div> nested
 * inside another interactive element. It's a Menu
 * (Radix DropdownMenu) now, composed via asChild onto the existing
 * inner <div> rather than Radix's own default <button> Trigger, to
 * avoid nesting a button inside a button.
 */
describe('BoxRadioField version-options dropdown', () => {
  const choices = [
    {
      value: 'ubuntu',
      label: 'Ubuntu',
      options: [
        { value: 'ubuntu-20', label: 'Ubuntu 20.04' },
        { value: 'ubuntu-22', label: 'Ubuntu 22.04' },
      ],
    },
  ];

  it('opens the version dropdown and selecting an option updates the field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    expect(() =>
      render(
        <BoxRadioField
          input={{ value: 'ubuntu-20', onChange } as any}
          choices={choices}
        />,
      ),
    ).not.toThrow();

    await user.click(screen.getByText('Ubuntu 20.04'));
    await user.click(screen.getByText('Ubuntu 22.04'));

    expect(onChange).toHaveBeenCalledWith('ubuntu-22');
  });

  it('lists versions as radio items with the current one checked', async () => {
    const user = userEvent.setup();
    render(
      <BoxRadioField
        input={{ value: 'ubuntu-20', onChange: vi.fn() } as any}
        choices={choices}
      />,
    );

    await user.click(screen.getByText('Ubuntu 20.04'));

    expect(
      await screen.findByRole('menuitemradio', { name: 'Ubuntu 20.04' }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: 'Ubuntu 22.04' }),
    ).toHaveAttribute('aria-checked', 'false');
  });
});
