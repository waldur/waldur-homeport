import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminMatrixAppserviceStatusRetrieve,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { getKeyTitle } from '@/administration/settings/utils';
import { renderWithProviders } from '@/test/harness';

import { MatrixAdminSettingsTab } from './MatrixAdminSettingsTab';
import {
  DEPLOYMENT_KEYS,
  LIVEKIT_DEPLOYMENT_KEYS,
  SSO_DEPLOYMENT_KEYS,
} from './useMatrixAppserviceStatus';

const REASON =
  'Set by the deployment on every deploy. Change it there and redeploy.';

const editButton = (key: string) =>
  within(
    // Anchored: a description can quote another setting's title.
    screen.getByRole('row', { name: new RegExp(`^${getKeyTitle(key)}`) }),
  ).getByTestId('compact-edit-button');

const renderTab = (marker: string, extra: Record<string, unknown> = {}) => {
  vi.mocked(overrideSettingsRetrieve).mockResolvedValue({
    data: {
      ...Object.fromEntries(DEPLOYMENT_KEYS.map((key) => [key, 'x'])),
      MATRIX_ENABLED: true,
      MATRIX_TOKENS_MANAGED_BY: marker,
      ...extra,
    },
  } as any);
  renderWithProviders(<MatrixAdminSettingsTab />);
};

describe('MatrixAdminSettingsTab', () => {
  beforeEach(() => {
    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockResolvedValue({
      data: { transaction_count: 0 },
    } as any);
  });

  it('locks what the deployment writes and says why', async () => {
    // The deployment writes these back on every deploy, so an edit here would
    // be reverted, and a changed token would break chat until then.
    renderTab('deployment');

    expect(
      await screen.findByText('These settings are managed by the deployment'),
    ).toBeInTheDocument();
    DEPLOYMENT_KEYS.forEach((key) => {
      expect(editButton(key)).toBeDisabled();
      expect(editButton(key)).toHaveAccessibleName(REASON);
    });
  });

  it('names the locked settings in the notice', async () => {
    renderTab('deployment');

    expect(
      await screen.findByText(
        new RegExp(`locked on this page: ${getKeyTitle(DEPLOYMENT_KEYS[0])}`),
      ),
    ).toBeInTheDocument();
  });

  it('locks the SSO settings while the deployment signs in through OIDC', async () => {
    renderTab('deployment', {
      MATRIX_EXTERNAL_LOGIN_METHOD: 'oidc',
      MATRIX_SSO_REGISTRATION_METHOD: 'idp',
    });

    await screen.findByText('These settings are managed by the deployment');
    SSO_DEPLOYMENT_KEYS.forEach((key) => {
      expect(editButton(key)).toBeDisabled();
    });
  });

  it('leaves the login method to staff when the deployment has no SSO', async () => {
    // Without SSO the packagers pass neither setting, so an administrator's
    // choice survives the next deploy.
    renderTab('deployment', { MATRIX_EXTERNAL_LOGIN_METHOD: 'password' });

    await screen.findByText('These settings are managed by the deployment');
    SSO_DEPLOYMENT_KEYS.forEach((key) => {
      expect(editButton(key)).toBeEnabled();
    });
  });

  it('locks the LiveKit settings once the deployment has seeded them', async () => {
    renderTab('deployment', {
      MATRIX_LIVEKIT_URL: 'http://livekit.internal:7880',
      MATRIX_LIVEKIT_PUBLIC_URL: 'wss://chat.example.com/livekit',
    });

    await screen.findByText('These settings are managed by the deployment');
    LIVEKIT_DEPLOYMENT_KEYS.forEach((key) => {
      expect(editButton(key)).toBeDisabled();
    });
  });

  it('leaves the LiveKit settings editable when the deployment has no calls', async () => {
    renderTab('deployment');

    await screen.findByText('These settings are managed by the deployment');
    LIVEKIT_DEPLOYMENT_KEYS.forEach((key) => {
      expect(editButton(key)).toBeEnabled();
    });
  });

  it('keeps the marker editable so the deployment can hand control back', async () => {
    renderTab('deployment');

    await screen.findByText('These settings are managed by the deployment');
    expect(editButton('MATRIX_TOKENS_MANAGED_BY')).toBeEnabled();
  });

  it('keeps the chat switch editable', async () => {
    // The deployment switches chat on only at its first seeding, so this tab
    // is where staff turn it off, and that choice survives the next deploy.
    renderTab('deployment');

    await screen.findByText('These settings are managed by the deployment');
    expect(editButton('MATRIX_ENABLED')).toBeEnabled();
  });

  it('leaves a hand-configured installation editable', async () => {
    renderTab('');

    await screen.findByText('Runtime status');
    expect(
      screen.queryByText('These settings are managed by the deployment'),
    ).not.toBeInTheDocument();
    DEPLOYMENT_KEYS.forEach((key) => expect(editButton(key)).toBeEnabled());
  });
});
