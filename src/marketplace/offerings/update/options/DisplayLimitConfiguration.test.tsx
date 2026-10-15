import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import {
  DisplayLimitConfiguration,
  getUsageComponentOptions,
} from './DisplayLimitConfiguration';
import { OptionSettingsForm } from './OptionForm';

const offering = {
  components: [
    { type: 'storage', name: 'Storage', billing_type: 'limit' },
    { type: 'inodes', name: 'Inodes', billing_type: 'usage' },
    { type: 'cpu', name: 'CPU', billing_type: 'usage' },
    { type: 'setup', name: 'Setup', billing_type: 'one' },
  ],
} as any;

const renderComponent = (testOffering) =>
  render(
    <Form
      onSubmit={() => {}}
      render={() => <DisplayLimitConfiguration offering={testOffering} />}
    />,
  );

describe('getUsageComponentOptions', () => {
  it('offers the usage-based components only', () => {
    expect(getUsageComponentOptions(offering)).toEqual([
      { value: 'inodes', label: 'Inodes (inodes)' },
      { value: 'cpu', label: 'CPU (cpu)' },
    ]);
  });

  it('copes with an offering that has no components', () => {
    expect(getUsageComponentOptions(undefined)).toEqual([]);
    expect(getUsageComponentOptions({} as any)).toEqual([]);
  });
});

describe('DisplayLimitConfiguration', () => {
  it('shows the field when there is a usage-based component', () => {
    renderComponent(offering);
    expect(screen.getByText('Show as limit of')).toBeInTheDocument();
  });

  it('renders nothing without usage-based components', () => {
    const { container } = renderComponent({
      components: [{ type: 'storage', name: 'Storage', billing_type: 'limit' }],
    });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('OptionSettingsForm', () => {
  const renderSettings = (resourceType, type = 'integer') =>
    render(
      <Form
        onSubmit={() => {}}
        initialValues={{ type: { value: type } }}
        render={() => (
          <OptionSettingsForm offering={offering} resourceType={resourceType} />
        )}
      />,
    );

  it('offers the field on an integer resource option', () => {
    renderSettings('resource_options');
    expect(screen.getByText('Show as limit of')).toBeInTheDocument();
  });

  it('does not offer it on an integer order option', () => {
    renderSettings('options');
    expect(screen.queryByText('Show as limit of')).not.toBeInTheDocument();
  });

  it('does not offer it on a non-integer resource option', () => {
    renderSettings('resource_options', 'select_string');
    expect(screen.queryByText('Show as limit of')).not.toBeInTheDocument();
  });
});
