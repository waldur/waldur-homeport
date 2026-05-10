import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rancherClusterSecurityGroupsUpdate } from 'waldur-js-client';

import { ClusterSecurityGroupSetRulesDialog } from './ClusterSecurityGroupSetRulesDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    rancherClusterSecurityGroupsUpdate: vi.fn(),
  };
});

const fakeResource = {
  uuid: 'cluster-uuid',
  name: 'test-cluster',
  rules: [
    {
      from_port: 80,
      to_port: 80,
      cidr: '0.0.0.0/0',
      protocol: 'tcp',
      ethertype: 'IPv4',
      direction: 'ingress',
    },
  ],
};

const renderDialog = (resource = fakeResource) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ClusterSecurityGroupSetRulesDialog
          resolve={{ resource: resource as any, refetch: vi.fn() }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('ClusterSecurityGroupSetRulesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with initial rules', async () => {
    renderDialog();
    expect(
      await screen.findByText(/Set rules in test-cluster security group/i),
    ).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('80').length).toBe(1);
    expect(screen.getByDisplayValue('0.0.0.0/0')).toBeInTheDocument();
  });

  it('submits updated rules', async () => {
    vi.mocked(rancherClusterSecurityGroupsUpdate).mockResolvedValue({} as any);
    renderDialog();
    await screen.findByText(/Set rules in test-cluster security group/i);

    const submitButton = screen.getByRole('button', {
      name: /^Set rules$/,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(rancherClusterSecurityGroupsUpdate).toHaveBeenCalled();
    });
  });
});
