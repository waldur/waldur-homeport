/* eslint-disable testing-library/no-node-access -- where the help trigger sits in the DOM is what these tests check */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { Switch } from './Switch';

/**
 * The "?" that explains a check control. It is a button, so it takes keyboard
 * focus and a click on it reads the help. It must not live inside the
 * `<label>`: a click there would toggle the control, and a button inside a
 * label is a second thing the label names, so `getByLabelText` finds two.
 */

const HELP = 'Billed as storage.';
const onChange = vi.fn();

const CONTROLS: Array<[string, () => ReactElement]> = [
  [
    'Checkbox',
    () => <Checkbox label="Backups" tooltip={HELP} onChange={onChange} />,
  ],
  [
    'Switch',
    () => (
      <Switch
        label="Backups"
        tooltip={HELP}
        checked={false}
        onCheckedChange={onChange}
      />
    ),
  ],
  ['Radio', () => <Radio label="Backups" tooltip={HELP} onChange={onChange} />],
];

describe.each(CONTROLS)('%s with a tooltip', (_name, renderControl) => {
  it('is named by its label alone, with one control per label', () => {
    render(renderControl());
    const input = screen.getByLabelText('Backups');
    expect(screen.getAllByLabelText('Backups')).toHaveLength(1);
    expect(input).toHaveAccessibleName('Backups');
  });

  it('keeps the help button outside the label', () => {
    render(renderControl());
    const help = screen.getByRole('button', { name: 'Help' });
    expect(help.closest('label')).toBeNull();
  });

  it('does not toggle the control when the help is clicked', async () => {
    onChange.mockClear();
    render(renderControl());
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Backups')).not.toBeChecked();
  });

  it('still toggles from the label text', async () => {
    onChange.mockClear();
    render(renderControl());
    await userEvent.click(screen.getByText('Backups'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reaches the help by keyboard, right after the control', async () => {
    render(renderControl());
    await userEvent.tab();
    expect(screen.getByLabelText('Backups')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus();
  });

  it('shows the help text when the button is focused', async () => {
    render(renderControl());
    await userEvent.tab();
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP);
  });
});

describe('RadioGroup with a tooltip', () => {
  const group = () => (
    <RadioGroup
      label="Billing period"
      tooltip={HELP}
      value="monthly"
      onValueChange={onChange}
      options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'annual', label: 'Annual' },
      ]}
    />
  );

  it('names the group by its legend text, not by the help button', () => {
    render(group());
    expect(screen.getByRole('group')).toHaveAccessibleName('Billing period');
  });

  it('puts a focusable help button in the legend', async () => {
    render(group());
    const help = screen.getByRole('button', { name: 'Help' });
    expect(help.closest('legend')).not.toBeNull();
    help.focus();
    expect(help).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP);
  });

  it('does not change the selection when the help is clicked', async () => {
    onChange.mockClear();
    render(group());
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });
});
