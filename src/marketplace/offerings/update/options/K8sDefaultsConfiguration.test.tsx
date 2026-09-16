import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { K8sDefaultsConfiguration } from './K8sDefaultsConfiguration';

const renderComponent = (initialValues = {}) =>
  render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <K8sDefaultsConfiguration />
        </form>
      )}
    />,
  );

describe('K8sDefaultsConfiguration load balancer mode', () => {
  it('treats a missing mode as always included', () => {
    renderComponent();

    expect(screen.getByText('Load balancer nodes')).toBeInTheDocument();
    expect(screen.getByText('Always included')).toBeInTheDocument();
    expect(screen.getByText('vCPUs per Load Balancer')).toBeInTheDocument();
  });

  it('shows the selected mode and keeps sizing when optional', () => {
    renderComponent({ default_configs: { load_balancer_mode: 'optional' } });

    expect(screen.getByText('Customer chooses')).toBeInTheDocument();
    expect(screen.getByText('vCPUs per Load Balancer')).toBeInTheDocument();
  });

  it('hides load balancer sizing when not offered', () => {
    renderComponent({ default_configs: { load_balancer_mode: 'disabled' } });

    expect(screen.getByText('Not offered')).toBeInTheDocument();
    expect(
      screen.queryByText('vCPUs per Load Balancer'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data Disk per Load Balancer (GB)'),
    ).not.toBeInTheDocument();
  });
});
