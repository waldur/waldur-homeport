import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BaseCredentialsSection } from './BaseCredentialsSection';

describe('BaseCredentialsSection', () => {
  const mockOffering = {
    uuid: 'uuid',
    secret_options: {},
    service_attributes: {},
    plugin_options: {},
  } as any;

  it('renders children within FormTable and provides scope context', () => {
    const TestChild = () => <div data-testid="test-child" />;

    renderWithProviders(
      <BaseCredentialsSection offering={mockOffering} refetch={async () => {}}>
        <TestChild />
      </BaseCredentialsSection>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument(); // OfferingScopeState label
  });

  it('hides OfferingScopeState when hideScopeState is true', () => {
    renderWithProviders(
      <BaseCredentialsSection
        offering={mockOffering}
        hideScopeState
        refetch={async () => {}}
      >
        <div data-testid="test-child" />
      </BaseCredentialsSection>,
    );

    expect(screen.queryByText('State')).not.toBeInTheDocument();
  });
});
