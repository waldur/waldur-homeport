import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { isAdvancedIntegrationVisible } from './advancedIntegration';
import { AdvancedIntegrationSection } from './AdvancedIntegrationSection';

const offering = (type: string, plugin_options = {}) =>
  ({ uuid: 'offering-uuid', type, plugin_options }) as any;

describe('AdvancedIntegrationSection', () => {
  // FirecREST fronts the SLURM clusters a site agent manages, so the HPC
  // workspace settings belong to site-agent offerings only.
  it('offers the HPC workspace settings on a site-agent offering', () => {
    renderWithProviders(
      <AdvancedIntegrationSection
        offering={offering('Marketplace.SiteAgent', {
          firecrest_api_url: 'https://firecrest.example.org',
          firecrest_system_name: 'cluster-a',
        })}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('FirecREST API URL')).toBeInTheDocument();
    expect(
      screen.getByText('https://firecrest.example.org'),
    ).toBeInTheDocument();
    expect(screen.getByText('slurm-monitor API URL')).toBeInTheDocument();
  });

  it('is not shown for an offering without a site agent', () => {
    expect(isAdvancedIntegrationVisible(offering('Marketplace.Basic'))).toBe(
      false,
    );
    expect(
      isAdvancedIntegrationVisible(offering('Marketplace.SiteAgent')),
    ).toBe(true);
    // The type's former name, which an older backend still returns.
    expect(isAdvancedIntegrationVisible(offering('Marketplace.Slurm'))).toBe(
      true,
    );
  });
});
