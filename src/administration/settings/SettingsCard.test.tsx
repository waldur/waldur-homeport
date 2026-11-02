import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { SettingsCard } from './SettingsCard';
import { SettingGroupDescription } from './types';

const mockGroup: SettingGroupDescription = {
  description: 'General Settings',
  items: [
    {
      key: 'SITE_NAME',
      description: 'Human-friendly name of the deployment.',
      default: 'Waldur',
      type: 'string',
    },
  ],
};

describe('SettingsCard', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('renders a card from a single group object', () => {
    render(
      <SettingsCard
        group={mockGroup}
        values={{ SITE_NAME: 'My Custom Waldur' }}
      />,
    );

    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Site name')).toBeInTheDocument();
    expect(screen.getByText('My Custom Waldur')).toBeInTheDocument();
  });

  it('renders custom header actions', () => {
    render(
      <SettingsCard
        group={mockGroup}
        values={{ SITE_NAME: 'My Custom Waldur' }}
        actions={<button type="button">Custom Action</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Custom Action' }),
    ).toBeInTheDocument();
  });

  it('supports legacy settingsSource prop', () => {
    render(
      <SettingsCard
        group={mockGroup}
        settingsSource={{ SITE_NAME: 'Legacy Prop Waldur' }}
      />,
    );

    expect(screen.getByText('Legacy Prop Waldur')).toBeInTheDocument();
  });
});
