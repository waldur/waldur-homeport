import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MappingStep } from './MappingStep';

const source = {
  uuid: 'source',
  name: 'Old cloud',
  plans: [{ uuid: 'plan', name: 'Basic', unit: 'month' }],
  components: [],
} as unknown as ProviderOfferingDetails;

const target = {
  uuid: 'target',
  name: 'New cloud',
  plans: [],
  components: [],
} as unknown as ProviderOfferingDetails;

const draft = {
  plan_mapping: {},
  component_mapping: {},
  attribute_key_mapping: {},
  invoice_policy: 'per_source',
} as any;

describe('MappingStep', () => {
  it('heads plan and component groups with real headings, outside the rows', () => {
    renderWithProviders(
      <MappingStep
        sources={[source]}
        target={target}
        draft={draft}
        onChange={vi.fn()}
        disabled={false}
      />,
    );

    for (const name of ['Plans', 'Components']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    // A heading cannot sit in a <dt>, and every row has a value to name.
    for (const term of screen.getAllByRole('term')) {
      expect(within(term).queryByRole('heading')).not.toBeInTheDocument();
    }
    for (const definition of screen.getAllByRole('definition')) {
      expect(definition).not.toHaveTextContent(/^\s*$/);
    }
  });
});
