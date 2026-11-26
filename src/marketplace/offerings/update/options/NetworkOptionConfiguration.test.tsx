import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import {
  CidrPolicyConfiguration,
  IpsecPolicyConfiguration,
} from './NetworkOptionConfiguration';

const renderWithForm = (children, initialValues = {}) =>
  render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>{children}</form>
      )}
    />,
  );

const OFFERING: any = {
  options: {
    order: ['net', 'vpn'],
    options: {
      net: { type: 'cidr', label: 'Cluster network' },
      vpn: { type: 'ipsec_vpn_config', label: 'VPN' },
    },
  },
  resource_options: { order: [], options: {} },
};

describe('CidrPolicyConfiguration', () => {
  it('asks for the most networks only for a list', () => {
    renderWithForm(<CidrPolicyConfiguration />);
    expect(screen.queryByText('Most networks')).not.toBeInTheDocument();
  });

  it('shows the limit of a list', () => {
    renderWithForm(<CidrPolicyConfiguration />, {
      default_configs: { multiple: true },
    });
    expect(screen.getByText('Most networks')).toBeInTheDocument();
  });
});

describe('IpsecPolicyConfiguration', () => {
  it('shows both phases and the defaults that apply when none is set', () => {
    renderWithForm(<IpsecPolicyConfiguration offering={OFFERING} />);
    expect(screen.getByText('Phase 1 (IKE) proposals')).toBeInTheDocument();
    expect(screen.getByText('Phase 2 (IPsec) proposals')).toBeInTheDocument();
    // Phase 1's default lifetime and phase 2's longest one.
    expect(screen.getAllByPlaceholderText('28800')).toHaveLength(2);
    // Every choice in view, as a checkbox, in both phases.
    expect(
      screen.getAllByRole('checkbox', { name: 'AES-256-GCM' }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('checkbox', { name: 'None (no PFS)' }),
    ).not.toBeChecked();
  });

  it('offers the cidr options to keep clear of', () => {
    renderWithForm(<IpsecPolicyConfiguration offering={OFFERING} />);
    expect(
      screen.getByText(/Network \(CIDR\) options whose networks/),
    ).toBeInTheDocument();
  });

  it('says to add a cidr option when a resource option has none to name', () => {
    renderWithForm(
      <IpsecPolicyConfiguration
        offering={{ options: { order: [], options: {} } } as any}
        resourceType="resource_options"
      />,
    );
    expect(
      screen.getByText(/Add a Network \(CIDR\) option to this offering/),
    ).toBeInTheDocument();
  });
});

describe('IpsecPolicyConfiguration allowed choices', () => {
  it('saves the ticked choices in vocabulary order, and none as unset', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    let values: any;
    render(
      <Form
        onSubmit={() => {}}
        initialValues={{ default_configs: { phase2: { pfs_groups: [19] } } }}
        render={({ handleSubmit, values: current }) => {
          values = current;
          return (
            <form onSubmit={handleSubmit}>
              <IpsecPolicyConfiguration offering={OFFERING} />
            </form>
          );
        }}
      />,
    );
    const pfsNone = screen.getByRole('checkbox', { name: 'None (no PFS)' });
    await userEvent.click(pfsNone);
    expect(values.default_configs.phase2.pfs_groups).toEqual([19, null]);
    await userEvent.click(pfsNone);
    const groups = screen.getAllByRole('checkbox', {
      name: 'ECP 256 (group 19)',
    });
    await userEvent.click(groups[1]);
    // Unset, so the server's default list applies.
    expect(values.default_configs?.phase2?.pfs_groups).toBeUndefined();
  });
});
