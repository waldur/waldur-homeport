import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OptionSecretsCard } from './OptionSecretsCard';
import { getRevealError } from './RevealOptionSecretDialog';

const { hasPermission, canUpdate } = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  canUpdate: vi.fn(),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: (...args: any[]) => hasPermission(...args),
}));
vi.mock('./permissions', () => ({
  canUpdateResourceOptions: (...args: any[]) => canUpdate(...args),
}));

const STATUS = {
  is_set: true,
  source: 'customer',
  modified: '2026-11-25T12:00:00Z',
};

const offering = (configs = {}) =>
  ({
    options: {
      order: ['psk'],
      options: {
        psk: {
          type: 'secret',
          label: 'VPN pre-shared key',
          default_configs: configs,
        },
      },
    },
    resource_options: { order: [], options: {} },
  }) as any;

const resource = (status: any = STATUS, state = 'OK') =>
  ({
    uuid: 'r1',
    name: 'VPN VM',
    state,
    option_secrets: { psk: status },
    project_uuid: 'p1',
    customer_uuid: 'c1',
    provider_uuid: 'pr1',
    offering_uuid: 'o1',
  }) as any;

const render = (props) =>
  renderWithProviders(<OptionSecretsCard refetch={vi.fn()} {...props} />);

describe('OptionSecretsCard', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    hasPermission.mockReturnValue(true);
    canUpdate.mockReturnValue(true);
  });

  it('says whether the secret is set, never its value', () => {
    render({ resource: resource(), offering: offering() });
    expect(screen.getByText('VPN pre-shared key')).toBeInTheDocument();
    expect(screen.getByText('Set')).toBeInTheDocument();
    expect(screen.getByText('(by the customer)')).toBeInTheDocument();
  });

  it('lets the customer replace a secret they enter, not reveal it', () => {
    render({ resource: resource(), offering: offering() });
    expect(
      screen.getByRole('button', { name: /Set the secret/ }),
    ).toHaveTextContent('Replace');
    expect(
      screen.queryByRole('button', { name: /Reveal the secret/ }),
    ).not.toBeInTheDocument();
  });

  it('reveals to the customer only what the policy allows', () => {
    render({
      resource: resource(),
      offering: offering({ customer_can_reveal: true }),
    });
    expect(
      screen.getByRole('button', { name: /Reveal the secret/ }),
    ).toBeInTheDocument();
  });

  it('asks the customer nothing for a secret the provider sets', () => {
    render({
      resource: resource({ is_set: false, source: null, modified: null }),
      offering: offering({ secret_source: 'provider' }),
    });
    expect(
      screen.getByText('Not set: the provider sets it after provisioning'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /the secret/ }),
    ).not.toBeInTheDocument();
  });

  it('lets the provider set and reveal any secret in its view', () => {
    canUpdate.mockReturnValue(false);
    render({
      resource: resource(),
      offering: offering({ secret_source: 'provider' }),
      providerView: true,
    });
    expect(
      screen.getByRole('button', { name: /Set the secret/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Reveal the secret/ }),
    ).toBeInTheDocument();
  });

  it('shows the provider nothing to do without the permission', () => {
    hasPermission.mockReturnValue(false);
    render({ resource: resource(), offering: offering(), providerView: true });
    expect(
      screen.queryByRole('button', { name: /the secret/ }),
    ).not.toBeInTheDocument();
  });

  it('holds the replace back while the resource cannot take it', () => {
    render({ resource: resource(STATUS, 'Terminating'), offering: offering() });
    expect(
      screen.getByRole('button', { name: /Set the secret/ }),
    ).toBeDisabled();
  });

  it('lists only the secrets it is given', () => {
    const { container } = render({
      resource: resource(),
      offering: offering(),
      names: [],
    });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('getRevealError', () => {
  it('explains a refused reveal', () => {
    expect(getRevealError({ status: 409 })).toBe('The secret is not set yet.');
    expect(getRevealError({ status: 403 })).toBe(
      'You may not read this secret back.',
    );
    expect(
      getRevealError({ status: 403, detail: 'Customers may not reveal it.' }),
    ).toBe('Customers may not reveal it.');
  });
});
