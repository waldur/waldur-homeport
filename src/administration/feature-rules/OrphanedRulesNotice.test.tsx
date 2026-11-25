import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { featureRulesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OrphanedRulesNotice } from './OrphanedRulesNotice';

const page = (rules: any[]) =>
  ({
    data: rules,
    response: {
      headers: new Headers({ 'x-result-count': String(rules.length) }),
    },
  }) as any;

describe('OrphanedRulesNotice', () => {
  it('names the keys of rules without effect, and asks only orphaned ones', async () => {
    vi.mocked(featureRulesList).mockResolvedValue(
      page([
        { uuid: 'r1', feature_key: 'marketplace.call_only' },
        { uuid: 'r2', feature_key: 'micro_apps.gone-app' },
      ]),
    );
    renderWithProviders(<OrphanedRulesNotice canEdit />);

    const notice = await screen.findByTestId('orphaned-feature-rules');
    expect(notice).toHaveTextContent(
      'marketplace.call_only, micro_apps.gone-app',
    );
    expect(
      screen.getByRole('button', { name: 'Delete them' }),
    ).toBeInTheDocument();
    expect(featureRulesList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ orphaned: true }),
      }),
    );
  });

  it('shows nothing when every rule has an effect', async () => {
    vi.mocked(featureRulesList).mockResolvedValue(page([]));
    const { container } = renderWithProviders(
      <OrphanedRulesNotice canEdit={false} />,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container).toBeEmptyDOMElement();
  });
});
