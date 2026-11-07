import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallOfferingRequestStateField } from './CallOfferingRequestStateField';

describe('CallOfferingRequestStateField', () => {
  it('names the provider a requested offering waits for', () => {
    renderWithProviders(
      <CallOfferingRequestStateField
        row={{ state: 'requested', provider_name: 'North Centre' }}
      />,
    );
    expect(screen.getByText('Waiting for North Centre')).toBeInTheDocument();
  });

  it('says nothing more once the provider has accepted', () => {
    renderWithProviders(
      <CallOfferingRequestStateField
        row={{ state: 'accepted', provider_name: 'North Centre' }}
      />,
    );
    expect(screen.queryByText(/Waiting for/)).toBeNull();
  });
});
