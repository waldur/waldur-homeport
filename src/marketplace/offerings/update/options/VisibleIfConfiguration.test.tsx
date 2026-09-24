import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { formatOption } from '../../store/utils';

import { validateOptionForm } from './validation';
import { VisibleIfConfiguration } from './VisibleIfConfiguration';

const options: any = {
  order: ['velero_backups', 'kind', 'size', 'velero_account'],
  options: {
    velero_backups: { type: 'boolean', label: 'Velero backups' },
    kind: {
      type: 'select_string_multi',
      label: 'Kind',
      choices: ['etcd', 'velero'],
    },
    size: { type: 'integer', label: 'Size' },
    velero_account: {
      type: 'select_string',
      label: 'Velero account',
      choices: ['own', 'new'],
    },
  },
};

const renderComponent = (optionKey?: string, initialValues = {}) => {
  const onSubmit = vi.fn();
  render(
    <Form
      onSubmit={onSubmit}
      initialValues={{
        name: 'x',
        label: 'X',
        type: { value: 'string' },
        ...initialValues,
      }}
      validate={(values) => validateOptionForm(values, { options, optionKey })}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <VisibleIfConfiguration options={options} optionKey={optionKey} />
          <button type="submit" disabled={invalid}>
            Submit
          </button>
        </form>
      )}
    />,
  );
  return onSubmit;
};

const submittedOption = (onSubmit) =>
  formatOption(onSubmit.mock.calls.at(-1)[0]);

describe('VisibleIfConfiguration', () => {
  it('is not shown when no earlier option can control visibility', () => {
    renderComponent('velero_backups');
    expect(screen.queryByText('Show only when')).not.toBeInTheDocument();
  });

  it('offers only earlier options of supported types', async () => {
    renderComponent('size');
    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }));
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Velero backups')).toBeInTheDocument();
    expect(screen.getByText('Kind')).toBeInTheDocument();
    expect(screen.queryByText('Size')).not.toBeInTheDocument();
    expect(screen.queryByText('Velero account')).not.toBeInTheDocument();
  });

  it('sets a rule on a boolean option', async () => {
    const onSubmit = renderComponent('velero_account');
    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Velero backups'));
    expect(screen.getByText('Select at least one value.')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('combobox')[1]);
    await userEvent.click(screen.getByText('Checked'));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submittedOption(onSubmit).visible_if).toEqual({
      field: 'velero_backups',
      values: [true],
    });
  });

  it('changes the referenced option and resets the values', async () => {
    const onSubmit = renderComponent('velero_account', {
      visible_if: { field: 'velero_backups', values: [true] },
    });
    expect(screen.getByText('Checked')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('combobox')[0]);
    await userEvent.click(screen.getByText('Kind'));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();

    await userEvent.click(screen.getAllByRole('combobox')[1]);
    await userEvent.click(screen.getByText('velero'));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submittedOption(onSubmit).visible_if).toEqual({
      field: 'kind',
      values: ['velero'],
    });
  });

  it('explains the button before a rule exists', () => {
    renderComponent('velero_account');
    expect(
      screen.getByText(
        'Show this option only for certain answers to an earlier option.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Hidden answers aren't saved/),
    ).not.toBeInTheDocument();
  });

  it('warns about the consequences only once a rule exists', () => {
    renderComponent('velero_account', {
      visible_if: { field: 'velero_backups', values: [true] },
    });
    expect(screen.getByText(/Hidden answers aren't saved/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Required only while visible/),
    ).not.toBeInTheDocument();
  });

  it('adds the required line when the option is required', () => {
    renderComponent('velero_account', {
      required: true,
      visible_if: { field: 'velero_backups', values: [true] },
    });
    expect(screen.getByText(/Required only while visible/)).toBeInTheDocument();
  });

  it('removes the rule', async () => {
    const onSubmit = renderComponent('velero_account', {
      visible_if: { field: 'velero_backups', values: [true] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Remove rule' }));
    expect(
      screen.getByRole('button', { name: 'Add rule' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submittedOption(onSubmit)).not.toHaveProperty('visible_if');
  });
});
