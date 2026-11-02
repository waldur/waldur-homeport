import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { SettingsPropertyList } from './SettingsPropertyList';
import { SettingItemDescription } from './types';

const mockItems: SettingItemDescription[] = [
  {
    key: 'SITE_NAME',
    description: 'Human-friendly name of the deployment.',
    default: 'Waldur',
    type: 'string',
  },
  {
    key: 'SHORT_PAGE_TITLE',
    description: 'Prefix for page title.',
    default: 'Waldur',
    type: 'string',
  },
];

describe('SettingsPropertyList', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('renders all setting items with their respective values', () => {
    render(
      <SettingsPropertyList
        items={mockItems}
        values={{
          SITE_NAME: 'Custom Cloud',
          SHORT_PAGE_TITLE: 'Custom',
        }}
      />,
    );

    expect(screen.getByText('Site name')).toBeInTheDocument();
    expect(screen.getByText('Custom Cloud')).toBeInTheDocument();
    expect(screen.getByText('Short page title')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('supports custom getValue and getEditDisabledReason', () => {
    render(
      <SettingsPropertyList
        items={mockItems}
        getValue={(item) => `Resolved: ${item.key}`}
        getEditDisabledReason={(item) =>
          item.key === 'SITE_NAME' ? 'Read-only deployment' : undefined
        }
      />,
    );

    expect(screen.getByText('Resolved: SITE_NAME')).toBeInTheDocument();
    expect(screen.getByText('Resolved: SHORT_PAGE_TITLE')).toBeInTheDocument();
  });
});
