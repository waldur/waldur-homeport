/* eslint-disable testing-library/no-node-access -- the fieldset and the layout wrapper are what these tests check */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RadioGroup, RadioGroupProps } from './RadioGroup';

/**
 * RadioGroup is native radios in a fieldset, so the browser supplies the
 * keyboard model: one tab stop, arrows that move the selection and skip
 * disabled options. These tests pin that to the markup (shared name, real
 * `disabled`, no stray `tabIndex`), so a rewrite that breaks it fails here.
 */

const OPTIONS = [
  { value: 'monthly', label: 'Monthly', description: 'First of the month' },
  { value: 'annual', label: 'Annual' },
  { value: 'usage', label: 'Usage-based', disabled: true },
  { value: 'prepaid', label: 'Prepaid' },
];

/** A group that keeps its own value, as a form field does. */
const Controlled = ({
  initial = 'monthly',
  ...props
}: { initial?: string | null } & Partial<RadioGroupProps<string>>) => {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <button type="button">After</button>
    </>
  );
};

const radio = (name: string) => screen.getByRole('radio', { name });

describe('keyboard', () => {
  it('moves the selection with the arrow keys, skipping disabled options', async () => {
    render(<Controlled />);
    await userEvent.tab();
    expect(radio(/Monthly/)).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(radio('Annual')).toBeChecked();
    expect(radio('Annual')).toHaveFocus();

    // Usage-based is disabled: the next stop is Prepaid.
    await userEvent.keyboard('{ArrowDown}');
    expect(radio('Prepaid')).toBeChecked();
    expect(radio('Usage-based')).not.toBeChecked();

    await userEvent.keyboard('{ArrowUp}');
    expect(radio('Annual')).toBeChecked();
  });

  it('wraps around at either end', async () => {
    render(<Controlled initial="prepaid" />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(radio(/Monthly/)).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    expect(radio('Prepaid')).toBeChecked();
  });

  it('is one tab stop: tab enters on the selected option and leaves the group', async () => {
    render(<Controlled initial="annual" />);
    await userEvent.tab();
    expect(radio('Annual')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('enters on the first option when nothing is selected', async () => {
    render(<Controlled initial={null} />);
    for (const r of screen.getAllByRole('radio')) {
      expect(r).not.toBeChecked();
    }
    await userEvent.tab();
    expect(radio(/Monthly/)).toHaveFocus();
  });

  it('reports each arrow move through onValueChange', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value="monthly"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenCalledWith('annual');
  });
});

describe('disabled', () => {
  it('puts the whole group out of reach: no tab stop, no click', async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <RadioGroup
          label="Billing period"
          options={OPTIONS}
          value="monthly"
          onValueChange={onValueChange}
          disabled
        />
        <button type="button">After</button>
      </>,
    );
    expect(screen.getByRole('group')).toBeDisabled();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await userEvent.click(screen.getByText('Annual'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('refuses a click on a disabled option and leaves the selection', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value="monthly"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByText('Usage-based'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(radio(/Monthly/)).toBeChecked();
  });
});

describe('naming and wiring', () => {
  it('gives each group its own generated name, and honours an explicit one', () => {
    render(
      <>
        <RadioGroup
          aria-label="First"
          options={OPTIONS}
          value="monthly"
          onValueChange={() => undefined}
        />
        <RadioGroup
          aria-label="Second"
          options={OPTIONS}
          value="monthly"
          onValueChange={() => undefined}
        />
        <RadioGroup
          aria-label="Third"
          name="period"
          options={OPTIONS}
          value="monthly"
          onValueChange={() => undefined}
        />
      </>,
    );
    const names = (group: string) =>
      new Set(
        Array.from(
          screen.getByRole('group', { name: group }).querySelectorAll('input'),
        ).map((input) => input.name),
      );
    const first = [...names('First')];
    const second = [...names('Second')];
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0]).not.toBe(second[0]);
    expect([...names('Third')]).toEqual(['period']);
  });

  it('selects nothing for a value that is not an option', () => {
    render(
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value="weekly"
        onValueChange={() => undefined}
      />,
    );
    for (const r of screen.getAllByRole('radio')) {
      expect(r).not.toBeChecked();
    }
  });

  it('names a group that has no legend by its aria-label', () => {
    render(
      <RadioGroup
        aria-label="Export format"
        options={[{ value: 'csv', label: 'CSV' }]}
        value="csv"
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole('group', { name: 'Export format' })).toBeVisible();
  });

  it('links an option description to its radio, and shows the group description', () => {
    render(
      <RadioGroup
        label="Billing period"
        description="Applies from the next invoice."
        options={OPTIONS}
        value="monthly"
        onValueChange={() => undefined}
      />,
    );
    expect(radio(/Monthly/)).toHaveAccessibleDescription('First of the month');
    expect(screen.getByText('Applies from the next invoice.')).toBeVisible();
  });

  it('reports focus and blur from every radio', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Controlled onFocus={onFocus} onBlur={onBlur} initial="monthly" />);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('layout', () => {
  it('stacks vertically by default and wraps in rows when horizontal', () => {
    const { rerender } = render(
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value="monthly"
        onValueChange={() => undefined}
      />,
    );
    const wrapper = () =>
      screen.getAllByRole('radio')[0].closest('fieldset')!
        .lastElementChild as HTMLElement;
    expect(wrapper()).toHaveClass('flex-col');
    rerender(
      <RadioGroup
        label="Billing period"
        options={OPTIONS}
        value="monthly"
        onValueChange={() => undefined}
        orientation="horizontal"
      />,
    );
    expect(wrapper()).toHaveClass('flex-wrap');
    expect(wrapper()).not.toHaveClass('flex-col');
  });
});
