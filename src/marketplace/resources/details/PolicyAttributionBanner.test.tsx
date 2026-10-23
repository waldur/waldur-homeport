import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PolicyAttributionBanner } from './PolicyAttributionBanner';

const resource = (overrides: Record<string, unknown> = {}) =>
  ({
    paused: true,
    downscaled: false,
    restrict_member_access: false,
    usage_limit_restriction: 'paused',
    usage_limit_resumes_at: null,
    spending_limit_status: [],
    offering_plugin_options: {
      supports_pausing: true,
      supports_downscaling: true,
    },
    offering_components: [{ type: 'tokens', name: 'Tokens' }],
    attributes: {},
    ...overrides,
  }) as any;

const renderBanner = (overrides: Record<string, unknown> = {}) =>
  renderWithProviders(
    <PolicyAttributionBanner resource={resource(overrides)} />,
  );

describe('PolicyAttributionBanner on a resource held by a usage limit', () => {
  // The total never resets, so usage never drops below it on its own.
  it('says a reached all-time limit holds until it is raised or cleared', () => {
    renderBanner({
      spending_limit_status: [
        { component_type: 'tokens', period: 'total', reached: true },
      ],
    });
    expect(
      screen.getByText('Resource paused: usage limit reached'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Held by: Tokens — All-time limit. Access stays paused until the all-time limit is raised or cleared.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/unpaused automatically/)).toBeNull();
  });

  it('says the restriction of a downscaled resource stays as long', () => {
    renderBanner({
      paused: false,
      downscaled: true,
      usage_limit_restriction: 'downscaled',
      spending_limit_status: [
        { component_type: 'tokens', period: 'total', reached: true },
      ],
    });
    expect(
      screen.getByText(
        'Held by: Tokens — All-time limit. The restriction stays until the all-time limit is raised or cleared.',
      ),
    ).toBeInTheDocument();
  });

  it('says when a reached calendar limit resets', () => {
    renderBanner({
      usage_limit_resumes_at: DateTime.now().plus({ days: 3 }).toISO(),
      spending_limit_status: [
        { component_type: 'tokens', period: 'month', reached: true },
      ],
    });
    expect(
      screen.getByText(
        /^Held by: Tokens — Monthly limit\. Access resumes .+, on .+\.$/,
      ),
    ).toBeInTheDocument();
  });

  // A limit-billed component over its limit leaves no time and no total.
  it('keeps the general wording when no spending limit says what lifts it', () => {
    renderBanner();
    expect(
      screen.getByText(
        'Reported usage reached the configured limit. It will be unpaused automatically when usage drops below the limit.',
      ),
    ).toBeInTheDocument();
  });
});
