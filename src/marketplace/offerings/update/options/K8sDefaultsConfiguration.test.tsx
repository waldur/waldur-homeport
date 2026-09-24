import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

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

describe('K8sDefaultsConfiguration topology mode', () => {
  it('shows the option type topology when no mode is set', () => {
    renderComponent({ type: { value: 'multi_datacenter_k8s_config' } });

    expect(screen.getByText('Cluster topology')).toBeInTheDocument();
    expect(
      screen.getByText('Three sites, 1 controller each'),
    ).toBeInTheDocument();
  });

  it('shows the single-site default for a single-datacenter option', () => {
    renderComponent({ type: { value: 'single_datacenter_k8s_config' } });

    expect(screen.getByText('Single site, 3 controllers')).toBeInTheDocument();
  });

  it.each([
    ['1-datacenter', 'Single site, 3 controllers'],
    ['3-datacenter', 'Three sites, 1 controller each'],
    ['customer_choice', 'Customer chooses'],
  ])('shows the selected %s mode', (mode, label) => {
    renderComponent({
      type: { value: 'single_datacenter_k8s_config' },
      default_configs: { topology_mode: mode, load_balancer_mode: 'disabled' },
    });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('blocks submission until the Kubernetes versions are given', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{ type: { value: 'single_datacenter_k8s_config' } }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <K8sDefaultsConfiguration />
            <button type="submit" disabled={invalid}>
              Save
            </button>
          </form>
        )}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Available Kubernetes Versions/ }),
      '1.34.0',
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('submits the selected mode', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{
          type: { value: 'multi_datacenter_k8s_config' },
          // Versions are mandatory now, so the form cannot submit without them.
          default_configs: { available_kubernetes_versions: '1.34.0' },
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <K8sDefaultsConfiguration />
            <button type="submit">Save</button>
          </form>
        )}
      />,
    );

    await userEvent.click(screen.getByText('Three sites, 1 controller each'));
    await userEvent.click(screen.getByText('Customer chooses'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        default_configs: {
          topology_mode: 'customer_choice',
          available_kubernetes_versions: '1.34.0',
        },
      }),
      expect.anything(),
      expect.anything(),
    );
  });

  it('can be cleared back to the option type default', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{
          type: { value: 'multi_datacenter_k8s_config' },
          default_configs: {
            topology_mode: '1-datacenter',
            available_kubernetes_versions: '1.30.0',
          },
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <K8sDefaultsConfiguration />
            <button type="submit">Save</button>
          </form>
        )}
      />,
    );

    expect(screen.getByText('Single site, 3 controllers')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('combobox', { name: /Cluster topology/ }),
    );
    await userEvent.keyboard('{Backspace}{Escape}');

    // The placeholder names the type's own topology again.
    expect(
      screen.getByText('Three sites, 1 controller each'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Single site, 3 controllers'),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const [values] = onSubmit.mock.calls[0];
    expect(values.default_configs).toEqual({
      available_kubernetes_versions: '1.30.0',
    });
  });
});
