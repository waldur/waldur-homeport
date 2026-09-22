import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingMergesCreate,
  marketplaceOfferingMergesExecute,
  marketplaceOfferingMergesRetrieve,
  marketplaceOfferingMergesSuggestMappingRetrieve,
  marketplaceProviderOfferingsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { OfferingMergeWizard } from './OfferingMergeWizard';

const merge = {
  uuid: 'merge',
  modified: '2026-09-19T10:00:00Z',
  state: 'previewed',
  sources: ['source'],
  target: 'target',
  source_offerings: [{ uuid: 'source', name: 'Old support', state: 'Active' }],
  target_offering: { uuid: 'target', name: 'New support', state: 'Active' },
  plan_mapping: {},
  component_mapping: {},
  attribute_key_mapping: {},
  invoice_policy: 'open_month',
  preview: {
    counts: { 'marketplace.Resource.offering': 2 },
    left_on_source: {},
    summaries_to_recompute: { components: 0, periods: [] },
    invoice_items: {
      policy: 'open_month',
      to_rewrite: 0,
      to_rewrite_by_policy: {},
      on_closed_invoices: 0,
      kept_on_closed_invoices: 0,
    },
    blockers: [],
    warnings: [
      { code: 'offering_user_on_both', message: 'Users stay', details: {} },
      { code: 'unknown_answer_keys', message: 'Keys differ', details: {} },
    ],
  },
  verification: null,
  progress: null,
  error_message: '',
};

const offering = (uuid: string) => ({
  uuid,
  name: uuid,
  type: 'Support.OfferingTemplate',
  plans: [],
  components: [],
  options: { order: [], options: {} },
});

const setParams = (params: Record<string, string>) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'admin-marketplace-offering-merge-wizard' },
    params,
  } as any);

describe('OfferingMergeWizard', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      is_staff: true,
    } as any);
    vi.mocked(marketplaceOfferingMergesRetrieve).mockResolvedValue({
      data: merge,
    } as any);
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockImplementation(
      ({ path }) => Promise.resolve({ data: offering(path.uuid) }) as any,
    );
  });

  it('enables the run once every warning of the preview is acknowledged', async () => {
    setParams({ merge: 'merge', step: '4' });
    const { rerender } = renderWithProviders(<OfferingMergeWizard />);

    const [first] = await screen.findAllByRole('checkbox', {
      name: /understand/i,
    });
    await userEvent.click(first);

    setParams({ merge: 'merge', step: '5' });
    rerender(<OfferingMergeWizard />);
    const run = await screen.findByRole('button', { name: /run merge/i });
    expect(run).toBeDisabled();

    setParams({ merge: 'merge', step: '4' });
    rerender(<OfferingMergeWizard />);
    const boxes = await screen.findAllByRole('checkbox', {
      name: /understand/i,
    });
    expect(boxes[0]).toBeChecked();
    await userEvent.click(boxes[1]);

    setParams({ merge: 'merge', step: '5' });
    rerender(<OfferingMergeWizard />);
    expect(
      await screen.findByRole('button', { name: /run merge/i }),
    ).toBeEnabled();
  });

  it('asks for a new preview once an edit returned the record to draft', async () => {
    vi.mocked(marketplaceOfferingMergesRetrieve).mockResolvedValue({
      data: { ...merge, state: 'draft', preview: null },
    } as any);
    setParams({ merge: 'merge', step: '4' });
    renderWithProviders(<OfferingMergeWizard />);

    expect(await screen.findByText('No current preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^next/i })).toBeDisabled();
  });

  it('shows a refused execute on the confirm step', async () => {
    vi.mocked(marketplaceOfferingMergesExecute).mockRejectedValue({
      detail: 'Every warning must be acknowledged.',
      missing_acknowledgements: ['unknown_answer_keys'],
    });
    vi.mocked(marketplaceOfferingMergesRetrieve).mockResolvedValue({
      data: { ...merge, preview: { ...merge.preview, warnings: [] } },
    } as any);
    setParams({ merge: 'merge', step: '5' });
    renderWithProviders(<OfferingMergeWizard />);

    await userEvent.click(
      await screen.findByRole('button', { name: /run merge/i }),
    );
    expect(
      await screen.findByText('Every warning must be acknowledged.'),
    ).toBeInTheDocument();
    expect(screen.getByText('unknown_answer_keys')).toBeInTheDocument();
  });

  it("creates a group's merge with the group's suggested mapping", async () => {
    vi.mocked(marketplaceOfferingMergesSuggestMappingRetrieve).mockClear();
    vi.mocked(marketplaceOfferingMergesCreate).mockResolvedValue({
      data: { ...merge, state: 'draft' },
    } as any);
    const mapping = {
      plan_mapping: { 'plan-dup': 'plan-keeper' },
      component_mapping: { dup: { cores: 'cores' } },
      unmatched_plans: [],
      unmatched_components: [],
    };
    setParams({ sources: 'dup', target: 'keeper', mapping } as any);
    renderWithProviders(<OfferingMergeWizard />);

    // The disabled button sits in a tooltip wrapper, so the enabled one is a
    // new node: query it again rather than holding the first.
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /create draft/i }),
      ).toBeEnabled(),
    );
    const create = screen.getByRole('button', { name: /create draft/i });
    await userEvent.click(create);

    await waitFor(() =>
      expect(marketplaceOfferingMergesCreate).toHaveBeenCalledWith({
        body: {
          sources: ['dup'],
          target: 'keeper',
          plan_mapping: { 'plan-dup': 'plan-keeper' },
          component_mapping: { dup: { cores: 'cores' } },
          invoice_policy: 'open_month',
        },
      }),
    );
    expect(
      marketplaceOfferingMergesSuggestMappingRetrieve,
    ).not.toHaveBeenCalled();
  });
});
