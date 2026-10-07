import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

describe('Radio', () => {
  // `:indeterminate` matches every radio in a group with nothing selected,
  // so an indeterminate fill on a radio paints all of them as selected.
  it('has no indeterminate styling', () => {
    render(<Radio aria-label="Lone" readOnly />);
    expect(screen.getByRole('radio').className).not.toMatch(/indeterminate:/);
  });

  it('selects within a named group', async () => {
    const onChange = vi.fn();
    render(
      <>
        <Radio name="g" value="a" aria-label="A" onChange={onChange} />
        <Radio name="g" value="b" aria-label="B" onChange={onChange} />
      </>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'monthly', label: 'Monthly', description: 'First of the month' },
    { value: 'annual', label: 'Annual' },
    { value: 'usage', label: 'Usage-based', disabled: true },
  ];

  it('names the group by its legend and shares one generated name', () => {
    render(
      <RadioGroup
        label="Billing period"
        options={options}
        value="annual"
        onValueChange={() => undefined}
      />,
    );
    expect(
      screen.getByRole('group', { name: 'Billing period' }),
    ).toBeInTheDocument();
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(screen.getByRole('radio', { name: /Annual/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Usage-based/ })).toBeDisabled();
  });

  it('reports the picked value', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Billing period"
        options={options}
        value="annual"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByText('Monthly'));
    expect(onValueChange).toHaveBeenCalledWith('monthly');
  });

  it('disables every option through the fieldset', () => {
    render(
      <RadioGroup
        label="Billing period"
        options={options}
        value="annual"
        onValueChange={() => undefined}
        disabled
      />,
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });
});
