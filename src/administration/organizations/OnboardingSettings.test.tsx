import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OnboardingSettings } from './OnboardingSettings';

beforeEach(() => {
  vi.mocked(overrideSettingsRetrieve).mockResolvedValue({ data: {} } as any);
});

vi.mock('./onboarding-setup/OnboardingSetup', () => ({
  OnboardingSetup: () => <span>Checklist setup</span>,
}));

vi.mock('../settings/SettingsCard', () => ({
  SettingsCard: () => <span>Onboarding settings</span>,
}));

const renderSettings = (user: { is_staff: boolean; is_support?: boolean }) => {
  const store = createStore(() => ({ workspace: { user } }) as any);
  return renderWithProviders(
    <Provider store={store}>
      <OnboardingSettings />
    </Provider>,
  );
};

describe('OnboardingSettings', () => {
  it('shows staff the checklist setup and the settings', async () => {
    renderSettings({ is_staff: true });

    expect(await screen.findByText('Onboarding settings')).toBeInTheDocument();
    expect(screen.getByText('Checklist setup')).toBeInTheDocument();
  });

  // The checklist setup reads checklists-admin, which answers support with 403.
  it('shows a support user the settings without the checklist setup', async () => {
    renderSettings({ is_staff: false, is_support: true });

    expect(await screen.findByText('Onboarding settings')).toBeInTheDocument();
    expect(screen.queryByText('Checklist setup')).not.toBeInTheDocument();
  });
});
