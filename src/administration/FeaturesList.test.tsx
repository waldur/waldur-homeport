import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { vi, describe, expect, beforeEach, it } from 'vitest';
import {
  featureRulesList,
  featureRulesPartialUpdate,
  featureValues,
  metadataFeaturesRetrieve,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import {
  applyUserFeatures,
  rememberPublicFeatures,
} from '@/features/userFeatures';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { FeaturesList } from './FeaturesList';

// Mock dependencies
vi.mock('@/features/FeaturesDescription', () => ({
  FeaturesDescription: [
    {
      key: 'billing',
      description: 'Billing features',
      items: [
        {
          key: 'enabled',
          description: 'Enable billing functionality',
        },
      ],
    },
    {
      key: 'support',
      description: 'Support features',
      items: [
        {
          key: 'enabled',
          description: 'Enable support functionality',
        },
      ],
    },
  ],
}));

// The checked segment of a feature's control, in any tab.
const stateOf = (feature: string) =>
  within(screen.getByTestId(feature))
    .getAllByRole('radio', { hidden: true })
    .find((radio) => radio.getAttribute('aria-checked') === 'true').textContent;

const choose = (feature: string, state: string) =>
  userEvent.click(
    within(screen.getByTestId(feature)).getByRole('radio', {
      name: state,
      hidden: true,
    }),
  );

describe('FeaturesList', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    ENV.FEATURES = {
      billing: {
        enabled: true,
      },
      support: {
        enabled: false,
      },
    } as any;
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-features' } as any,
      params: {},
    });
    vi.mocked(featureValues).mockReset();
  });

  it('shows feature states as text for support', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: true,
    } as any);
    renderWithProviders(<FeaturesList />);

    expect(screen.queryByTestId('billing.enabled')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Save/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Everyone')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('anchors and highlights the feature linked with ?setting=', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-features' } as any,
      params: { setting: 'billing.enabled' },
    });
    renderWithProviders(<FeaturesList />);

    const row = screen.getByTestId('feature-billing.enabled');
    expect(row).toHaveAttribute('id', 'feature-billing.enabled');
    expect(row).toHaveClass('bg-warning-subtle');
  });

  it('names each state control by its feature description', async () => {
    renderWithProviders(<FeaturesList />);

    expect(
      screen.getByRole('radiogroup', {
        name: 'Enable billing functionality',
        hidden: true,
      }),
    ).toBeInTheDocument();
    await choose('billing.enabled', 'Off');
    expect(stateOf('billing.enabled')).toBe('Off');
  });

  it('renders all feature sections', () => {
    renderWithProviders(<FeaturesList />);

    // Check if section titles are rendered
    expect(screen.getByText('Billing features')).toBeInTheDocument();
    expect(screen.getByText('Support features')).toBeInTheDocument();

    // Check if feature descriptions are rendered
    expect(
      screen.getByText('Enable billing functionality'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enable support functionality'),
    ).toBeInTheDocument();
  });

  it('initializes form with correct values', () => {
    renderWithProviders(<FeaturesList />);

    expect(stateOf('billing.enabled')).toBe('Everyone');
    expect(stateOf('support.enabled')).toBe('Off');
  });

  it('handles successful form submission', async () => {
    renderWithProviders(<FeaturesList />);

    await choose('billing.enabled', 'Off');
    await choose('support.enabled', 'Everyone');

    expect(stateOf('billing.enabled')).toBe('Off');
    expect(stateOf('support.enabled')).toBe('Everyone');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify API call
    expect(featureValues).toHaveBeenCalledWith({
      body: {
        billing: {
          enabled: false,
        },
        support: {
          enabled: true,
        },
      },
    });

    // Verify success notification
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Features have been updated.',
      );
    });
  });

  it('handles failed form submission', async () => {
    const error = new Error('API Error');
    vi.mocked(featureValues).mockRejectedValueOnce(error as never);

    renderWithProviders(<FeaturesList />);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update features.',
      );
    });
  });

  it('shows a single empty state when the search matches nothing', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-features' } as any,
      params: { q: 'zzz-no-match' },
    });

    renderWithProviders(<FeaturesList />);

    // Only the top-level "no results" empty state should render, exactly once.
    // Previously the active tab pane rendered a second one (duplication bug).
    expect(screen.getAllByText('No results found')).toHaveLength(1);
    expect(
      screen.getByText(
        'No matching features found. Try a different search term.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'No matching features in this section. Try a different search term.',
      ),
    ).not.toBeInTheDocument();
  });

  it('filters features and hides the empty state when the search matches', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-features' } as any,
      params: { q: 'billing' },
    });

    renderWithProviders(<FeaturesList />);

    expect(
      screen.getByText('Enable billing functionality'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'No matching features found. Try a different search term.',
      ),
    ).not.toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    vi.mocked(featureValues).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)) as any,
    );

    renderWithProviders(<FeaturesList />);

    const submitButton = screen.getByRole('button', { name: /Save/i });

    await userEvent.click(submitButton);

    // Verify button is disabled during submission
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('edits the public values, not the staff member’s own', () => {
    rememberPublicFeatures();
    // A rule turns support.enabled on for the signed-in staff member only.
    applyUserFeatures({ support: { enabled: true } });
    renderWithProviders(<FeaturesList />);

    expect(stateOf('support.enabled')).toBe('Off');
  });

  const mockScopesAndRules = (rules: any[]) => {
    vi.mocked(metadataFeaturesRetrieve).mockResolvedValue({
      data: {
        features: [
          {
            key: 'billing',
            description: 'Billing features',
            items: [{ key: 'enabled', description: '', scope: 'user' }],
          },
          {
            key: 'support',
            description: 'Support features',
            items: [{ key: 'enabled', description: '', scope: 'deployment' }],
          },
        ],
        feature_enums: {},
      },
    } as any);
    vi.mocked(featureRulesList).mockResolvedValue({
      data: rules,
      response: {
        headers: new Headers({ 'x-result-count': `${rules.length}` }),
      },
    } as any);
  };

  it('gives user-scoped features Off, Everyone and Selected users with their rule count', async () => {
    ENV.FEATURES = {
      billing: { enabled: false },
      support: { enabled: false },
    } as any;
    rememberPublicFeatures();
    mockScopesAndRules([
      { uuid: 'r1', feature_key: 'billing.enabled', is_active: true },
      { uuid: 'r2', feature_key: 'billing.enabled', is_active: false },
    ]);
    renderWithProviders(<FeaturesList />);

    await waitFor(() =>
      expect(stateOf('billing.enabled')).toBe('Selected users (1)'),
    );
    // A deployment-scoped feature cannot target selected users.
    expect(
      within(screen.getByTestId('support.enabled')).queryByRole('radio', {
        name: /Selected users/,
        hidden: true,
      }),
    ).not.toBeInTheDocument();
  });

  // The global modal mock: one openDialog shared by every useModal() call.
  const openDialog = () => useModal().openDialog;

  it('opens the rules when Selected users is chosen with none to turn on', async () => {
    ENV.FEATURES = {
      billing: { enabled: true },
      support: { enabled: false },
    } as any;
    rememberPublicFeatures();
    mockScopesAndRules([]);
    renderWithProviders(<FeaturesList />);

    await waitFor(() =>
      expect(
        within(screen.getByTestId('billing.enabled')).getByRole('radio', {
          name: 'Selected users',
          hidden: true,
        }),
      ).toBeInTheDocument(),
    );
    await choose('billing.enabled', 'Selected users');

    expect(openDialog()).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({ featureKey: 'billing.enabled' }),
      }),
    );
    // Off until a rule exists; saving turns the global value off.
    expect(stateOf('billing.enabled')).toBe('Off');
  });

  it('resumes the paused rules of a feature switched to Selected users', async () => {
    ENV.FEATURES = {
      billing: { enabled: false },
      support: { enabled: false },
    } as any;
    rememberPublicFeatures();
    mockScopesAndRules([
      { uuid: 'r1', feature_key: 'billing.enabled', is_active: false },
      { uuid: 'r2', feature_key: 'billing.enabled', is_active: false },
    ]);
    renderWithProviders(<FeaturesList />);

    await waitFor(() =>
      expect(
        within(screen.getByTestId('billing.enabled')).getByRole('radio', {
          name: 'Selected users',
          hidden: true,
        }),
      ).toBeInTheDocument(),
    );
    await choose('billing.enabled', 'Selected users');
    expect(stateOf('billing.enabled')).toBe('Selected users (2)');
    expect(openDialog()).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() =>
      expect(featureRulesPartialUpdate).toHaveBeenCalledTimes(2),
    );
    expect(featureRulesPartialUpdate).toHaveBeenCalledWith({
      path: { uuid: 'r1' },
      body: { is_active: true },
    });
  });

  it('deactivates the rules of a feature switched Off from Selected users', async () => {
    ENV.FEATURES = {
      billing: { enabled: false },
      support: { enabled: false },
    } as any;
    rememberPublicFeatures();
    mockScopesAndRules([
      { uuid: 'r1', feature_key: 'billing.enabled', is_active: true },
    ]);
    renderWithProviders(<FeaturesList />);

    await waitFor(() =>
      expect(stateOf('billing.enabled')).toBe('Selected users (1)'),
    );
    await userEvent.click(
      within(screen.getByTestId('billing.enabled')).getByRole('radio', {
        name: 'Off',
        hidden: true,
      }),
    );
    expect(stateOf('billing.enabled')).toBe('Off');
    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() =>
      expect(featureRulesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'r1' },
        body: { is_active: false },
      }),
    );
    expect(featureValues).toHaveBeenCalledWith({
      body: { billing: { enabled: false }, support: { enabled: false } },
    });
  });

  it('shows support the audience of user-scoped features read-only', async () => {
    ENV.FEATURES = {
      billing: { enabled: false },
      support: { enabled: false },
    } as any;
    rememberPublicFeatures();
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: true,
    } as any);
    mockScopesAndRules([
      { uuid: 'r1', feature_key: 'billing.enabled', is_active: true },
    ]);
    renderWithProviders(<FeaturesList />);

    expect(await screen.findByText('Selected users (1)')).toBeInTheDocument();
  });
});
