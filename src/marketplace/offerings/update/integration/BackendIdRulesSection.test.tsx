import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BackendIdRulesSection } from './BackendIdRulesSection';

describe('BackendIdRulesSection', () => {
  const mockOffering = {
    uuid: 'uuid',
    backend_id_rules: {
      format: { regex: '^[A-Z]{2}$' },
      uniqueness: { scope: 'offering', include_terminated: true },
    },
  } as any;

  it('renders the format and uniqueness fields', () => {
    renderWithProviders(
      <BackendIdRulesSection
        offering={mockOffering}
        refetch={async () => {}}
      />,
    );

    expect(screen.getByText('Backend ID rules')).toBeInTheDocument();
    expect(screen.getByText('Backend ID format (regex)')).toBeInTheDocument();
    expect(screen.getByText('Format hint')).toBeInTheDocument();
    expect(screen.getByText('Uniqueness scope')).toBeInTheDocument();
    expect(screen.getByText('Count terminated resources')).toBeInTheDocument();
  });

  it('renders without crashing when no rules are configured', () => {
    renderWithProviders(
      <BackendIdRulesSection
        offering={{ uuid: 'uuid' } as any}
        refetch={async () => {}}
      />,
    );

    expect(screen.getByText('Backend ID rules')).toBeInTheDocument();
  });
});
