import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@waldur/core/config';
import { useModal } from '@waldur/modal/hooks';

import { OpenStackTenantSummary } from './OpenStackTenantSummary';

// Mock ENV configuration
vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_OPENSTACK: {
        TENANT_CREDENTIALS_VISIBLE: true,
      },
      WALDUR_CORE: {},
    },
  },
}));
vi.mock('@waldur/modal/hooks');

const mockTenant = {
  name: 'Test tenant',
  uuid: 'test-uuid',
  access_url: 'http://example.com',
  user_username: 'test-user',
  user_password: 'test-password',
  quotas: [
    {
      name: 'vcpu',
      usage: 2,
      limit: 10,
    },
    {
      name: 'ram',
      usage: 1024,
      limit: 4096,
    },
    {
      name: 'storage',
      usage: 50,
      limit: 100,
    },
    {
      name: 'gigabytes_ssd',
      usage: 20,
      limit: 50,
    },
  ],
};

describe('OpenStackTenantSummary', () => {
  beforeEach(() => {
    vi.mocked(useModal).mockReturnValue({ openDialog: vi.fn() } as any);
  });
  it('renders basic tenant information', () => {
    render(<OpenStackTenantSummary resource={mockTenant as any} />);

    expect(screen.getByText('Access:')).toBeInTheDocument();
    expect(screen.getByText('Open')).toHaveAttribute(
      'href',
      'http://example.com',
    );
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
  });

  it('shows password toggle button', async () => {
    render(<OpenStackTenantSummary resource={mockTenant as any} />);
    const showButton = screen.queryByTestId('toggle-password');
    expect(showButton).toBeInTheDocument();

    await userEvent.click(showButton);
    expect(screen.getByText('test-password')).toBeInTheDocument();
  });

  it('displays quota information correctly', () => {
    render(<OpenStackTenantSummary resource={mockTenant as any} />);

    expect(screen.getByText('vCPU:')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('RAM:')).toBeInTheDocument();
    expect(screen.getByText('1/4 GB')).toBeInTheDocument();
  });

  it('hides credentials when TENANT_CREDENTIALS_VISIBLE is false', () => {
    ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE = false;
    render(<OpenStackTenantSummary resource={mockTenant as any} />);

    expect(screen.queryByText('test-user')).not.toBeInTheDocument();
    expect(screen.queryByText('test-password')).not.toBeInTheDocument();
  });
});
