import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

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
    // A fixed topology, so "Customer chooses" names only the load balancer.
    renderComponent({
      default_configs: {
        load_balancer_mode: 'optional',
        topology_mode: '1-datacenter',
      },
    });

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
  it('shows that the customer chooses when no mode is set', () => {
    renderComponent({
      type: { value: 'k8s_cluster_config' },
      default_configs: { load_balancer_mode: 'required' },
    });

    expect(screen.getByText('Cluster topology')).toBeInTheDocument();
    expect(screen.getByText('Customer chooses')).toBeInTheDocument();
  });

  it.each([
    ['1-datacenter', 'Single site, 3 controllers'],
    ['3-datacenter', 'Three sites, 1 controller each'],
    ['customer_choice', 'Customer chooses'],
  ])('shows the selected %s mode', (mode, label) => {
    renderComponent({
      type: { value: 'k8s_cluster_config' },
      default_configs: { topology_mode: mode, load_balancer_mode: 'disabled' },
    });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('blocks submission until the Kubernetes versions are given', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{ type: { value: 'k8s_cluster_config' } }}
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
          type: { value: 'k8s_cluster_config' },
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

    await userEvent.click(
      screen.getByRole('combobox', { name: /Cluster topology/ }),
    );
    await userEvent.click(screen.getByText('Three sites, 1 controller each'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        default_configs: {
          topology_mode: '3-datacenter',
          available_kubernetes_versions: '1.34.0',
        },
      }),
      expect.anything(),
      expect.anything(),
    );
  });

  it('can be cleared back to the customer choosing', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        onSubmit={onSubmit}
        initialValues={{
          type: { value: 'k8s_cluster_config' },
          default_configs: {
            load_balancer_mode: 'required',
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

    // The placeholder says the customer chooses again.
    expect(screen.getByText('Customer chooses')).toBeInTheDocument();
    expect(
      screen.queryByText('Single site, 3 controllers'),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const [values] = onSubmit.mock.calls[0];
    expect(values.default_configs).toEqual({
      load_balancer_mode: 'required',
      available_kubernetes_versions: '1.30.0',
    });
  });
});

describe('K8sDefaultsConfiguration site infrastructure', () => {
  const TENANTS = [
    { uuid: 'tallinn', name: 'Tallinn', customer_name: 'Provider' },
    { uuid: 'tartu', name: 'Tartu', customer_name: 'Provider' },
    { uuid: 'narva', name: 'Narva', customer_name: 'Provider' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
      data: TENANTS,
    } as any);
  });

  const renderForm = (defaultConfigs: Record<string, any>) => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <Form
        onSubmit={onSubmit}
        initialValues={{
          type: { value: 'k8s_cluster_config' },
          default_configs: {
            available_kubernetes_versions: '1.34.0',
            ...defaultConfigs,
          },
        }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <K8sDefaultsConfiguration
              offering={{ customer_uuid: 'provider' }}
            />
            <button type="submit" disabled={invalid}>
              Save
            </button>
          </form>
        )}
      />,
    );
    return onSubmit;
  };

  const picker = (name: string) => screen.getByRole('combobox', { name });

  const pick = async (name: string, site: string) => {
    await userEvent.click(picker(name));
    await userEvent.click(await screen.findByText(`${site} (Provider)`));
  };

  it('lets the customer pick when no mode is set', () => {
    renderForm({});

    expect(screen.getByText('Site infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Customer picks')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /: Site/ })).toBeNull();
    expect(marketplacePublicOfferingsList).not.toHaveBeenCalled();
  });

  it('offers a picker per site of every topology the customer may choose', async () => {
    renderForm({ infrastructure_mode: 'provider_fixed' });

    expect(screen.getByText('Provider fixes the sites')).toBeInTheDocument();
    expect(picker('Single site, 3 controllers: Site')).toBeInTheDocument();
    for (const n of [1, 2, 3]) {
      expect(
        picker(`Three sites, 1 controller each: Site ${n}`),
      ).toBeInTheDocument();
    }
    await waitFor(() =>
      expect(marketplacePublicOfferingsList).toHaveBeenCalledWith({
        // The sites must be the Kubernetes offering's own organisation's.
        query: expect.objectContaining({
          type: ['OpenStack.Tenant'],
          allowed_customer_uuid: 'provider',
          state: ['Active', 'Paused'],
        }),
      }),
    );
    expect(
      screen.getByText('Pick the site of the single-site layout.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pick all three sites of the three-site layout.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('offers only the pickers of a fixed topology', () => {
    renderForm({
      infrastructure_mode: 'provider_fixed',
      topology_mode: '1-datacenter',
    });

    expect(picker('Single site, 3 controllers: Site')).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', {
        name: 'Three sites, 1 controller each: Site 1',
      }),
    ).toBeNull();
    expect(
      screen.queryByText('Pick all three sites of the three-site layout.'),
    ).toBeNull();
  });

  it('refuses the same site twice', () => {
    renderForm({
      infrastructure_mode: 'provider_fixed',
      topology_mode: '3-datacenter',
      fixed_openstack_offerings: {
        '3-datacenter': ['tallinn', 'tartu', 'tallinn'],
      },
    });

    expect(
      screen.getByText('The three sites of the three-site layout must differ.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('submits the picked sites in order', async () => {
    const onSubmit = renderForm({
      infrastructure_mode: 'provider_fixed',
      topology_mode: '3-datacenter',
    });

    await pick('Three sites, 1 controller each: Site 1', 'Narva');
    await pick('Three sites, 1 controller each: Site 2', 'Tallinn');
    await pick('Three sites, 1 controller each: Site 3', 'Tartu');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const [values] = onSubmit.mock.calls[0];
    expect(values.default_configs).toEqual(
      expect.objectContaining({
        infrastructure_mode: 'provider_fixed',
        fixed_openstack_offerings: {
          '3-datacenter': ['narva', 'tallinn', 'tartu'],
        },
      }),
    );
  });

  it('can be cleared back to the customer picking', async () => {
    const onSubmit = renderForm({
      infrastructure_mode: 'provider_fixed',
      topology_mode: '1-datacenter',
      fixed_openstack_offerings: { '1-datacenter': ['tallinn'] },
    });

    await userEvent.click(
      screen.getByRole('combobox', { name: /Site infrastructure/ }),
    );
    await userEvent.keyboard('{Backspace}{Escape}');

    expect(
      screen.queryByRole('combobox', {
        name: 'Single site, 3 controllers: Site',
      }),
    ).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const [values] = onSubmit.mock.calls[0];
    expect(values.default_configs).not.toHaveProperty('infrastructure_mode');
  });
});
