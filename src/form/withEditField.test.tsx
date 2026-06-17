import { screen } from '@testing-library/react';
import { FieldRenderProps } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderWithProviders } from '@/test/harness';

import { EditFieldProvider } from './EditFieldContext';
import { withEditField } from './withEditField';

// Mock FormTable.Item to easily inspect what props it received
vi.mock('./FormTable', () => {
  return {
    default: {
      Item: (props: any) => (
        <div data-testid="form-table-item">
          <span data-testid="fti-value">{props.value}</span>
          <div data-testid="fti-actions">{props.actions}</div>
        </div>
      ),
    },
  };
});

// Mock FieldEditButton to easily inspect what props it received
vi.mock('./FieldEditButton', () => ({
  FieldEditButton: (props: any) => (
    <div
      data-testid="field-edit-button"
      data-tooltip={props.tooltip}
      data-icon={props.iconNode ? 'custom-icon' : 'default'}
    />
  ),
}));

describe('withEditField', () => {
  const DummyField = () => <input />;
  const EnhancedField = withEditField(DummyField);

  it('throws an error if rendered outside of EditFieldProvider', () => {
    // React testing library suppresses error boundaries by default, but we expect an error to be thrown.
    // To prevent the test from failing due to the uncaught error, we spy on console.error
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      renderWithProviders(<EnhancedField name="test" label="Test" />);
    }).toThrow(/"scope" and "callback" must be provided/);

    consoleError.mockRestore();
  });

  it('renders correctly within provider and propagates tooltip and iconNode', () => {
    const scope = { test: 'initial value' };
    const callback = vi.fn();

    renderWithProviders(
      <EditFieldProvider scope={scope} callback={callback}>
        <EnhancedField
          name="test"
          label="Test"
          tooltip="Custom Tooltip"
          iconNode={<div data-testid="custom-lock" />}
        />
      </EditFieldProvider>,
    );

    expect(screen.getByTestId('form-table-item')).toBeInTheDocument();

    const editBtn = screen.getByTestId('field-edit-button');
    expect(editBtn).toHaveAttribute('data-tooltip', 'Custom Tooltip');
    expect(editBtn).toHaveAttribute('data-icon', 'custom-icon');
  });

  it('respects renderValue override', () => {
    const scope = { test: 'initial value' };
    const callback = vi.fn();

    renderWithProviders(
      <EditFieldProvider scope={scope} callback={callback}>
        <EnhancedField
          name="test"
          label="Test"
          renderValue={(val) => <b data-testid="bold-val">{val}</b>}
        />
      </EditFieldProvider>,
    );

    expect(screen.getByTestId('bold-val')).toHaveTextContent('initial value');
  });

  it('falls back to a dash when renderValue returns null', () => {
    const scope = { test: null };
    const callback = vi.fn();

    renderWithProviders(
      <EditFieldProvider scope={scope} callback={callback}>
        <EnhancedField name="test" label="Test" renderValue={() => null} />
      </EditFieldProvider>,
    );

    expect(screen.getByTestId('fti-value')).toHaveTextContent(DASH_ESCAPE_CODE);
  });

  it('renders option labels (not raw values) for multi-select arrays', () => {
    const SelectLike = (props: FieldRenderProps<any>) => (
      <input {...props.input} />
    );
    const EnhancedSelect = withEditField(SelectLike);
    const scope = { roles: ['a', 'c'] };
    const callback = vi.fn();

    renderWithProviders(
      <EditFieldProvider scope={scope} callback={callback}>
        <EnhancedSelect
          name="roles"
          label="Roles"
          options={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
            { value: 'c', label: 'Gamma' },
          ]}
        />
      </EditFieldProvider>,
    );

    expect(screen.getByTestId('fti-value')).toHaveTextContent('Alpha, Gamma');
  });
});
