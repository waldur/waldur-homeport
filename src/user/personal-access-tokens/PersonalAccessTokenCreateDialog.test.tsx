import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PatTemplate,
  personalAccessTokensAvailableBindingEntitiesList,
  personalAccessTokensAvailableBindingTargetsList,
  personalAccessTokensAgentUser,
  personalAccessTokensAvailableScopesList,
  personalAccessTokensCreate,
  personalAccessTokensTemplatesList,
  personalAccessTokensTemplateTargetsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOptionInContainer } from '@/test/select';
import { useUser } from '@/workspace/hooks';

import { PersonalAccessTokenCreateDialog } from './PersonalAccessTokenCreateDialog';

const siteAgent: PatTemplate = {
  key: 'site_agent',
  name: 'Site agent',
  description: 'Lets a site agent process orders.',
  required_scopes: ['ORDER.APPROVE', 'OFFERING.MANAGE_AGENT'],
  optional_features: [
    {
      key: 'sync_components',
      name: 'Sync offering components',
      description: 'Create and update the components.',
      scopes: ['OFFERING.UPDATE_COMPONENTS'],
    },
    {
      key: 'resource_api_keys',
      name: 'Resource API keys',
      description: 'Manage API keys.',
      scopes: ['RESOURCE.MANAGE_API_KEY'],
    },
  ],
  binding_types: ['offering', 'customer'],
  default_lifetime_days: 365,
  dedicated_user_types: ['offering'],
};

const mockApi = (templates: PatTemplate[]) => {
  vi.mocked(personalAccessTokensTemplatesList).mockResolvedValue({
    data: templates,
  } as any);
  vi.mocked(personalAccessTokensAvailableScopesList).mockResolvedValue({
    data: [{ permission: 'PROJECT.LIST' }],
  } as any);
  vi.mocked(personalAccessTokensAvailableBindingTargetsList).mockResolvedValue({
    data: [{ permission: 'PROJECT.LIST', types: ['project'] }],
  } as any);
};

describe('PersonalAccessTokenCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides Site agent and starts at Target when no template is usable', async () => {
    mockApi([]);
    renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

    expect(
      await screen.findByText('Where will the token be used?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Site agent')).not.toBeInTheDocument();
    expect(screen.queryByText('Purpose')).not.toBeInTheDocument();
    expect(
      screen.getByText('Restrict to specific entities'),
    ).toBeInTheDocument();
  });

  it('offers Site agent next to Custom when the backend lists it', async () => {
    mockApi([siteAgent]);
    renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

    expect(
      await screen.findByText('What is the token for?'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Site agent/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Custom/)).toBeInTheDocument();
  });

  it('starts at Permissions with the target given, showing only grantable features', async () => {
    mockApi([siteAgent]);
    renderWithProviders(
      <PersonalAccessTokenCreateDialog
        resolve={{
          preset: {
            template: 'site_agent',
            target: {
              type: 'offering',
              uuid: 'offering-uuid',
              name: 'HPC',
              context: 'Org',
              features: ['sync_components'],
              staff_access: false,
              bindings: [{ type: 'offering', uuid: 'offering-uuid' }],
              suggested_username: '',
            },
            offering: { uuid: 'offering-uuid', name: 'HPC' },
          },
        }}
      />,
    );

    expect(
      await screen.findByText('What can the token do?'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('required-scopes')).toHaveTextContent(
      'OFFERING.MANAGE_AGENT',
    );
    expect(screen.getByText('Sync offering components')).toBeInTheDocument();
    expect(screen.queryByText('Resource API keys')).not.toBeInTheDocument();
  });

  it('lists every permission as a grouped checkbox in Custom mode', async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

    await screen.findByText('Where will the token be used?');
    await user.click(screen.getByRole('button', { name: /Next/ }));

    expect(
      await screen.findByText('What can the token do?'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  describe('site agent flow', () => {
    const offeringTarget = {
      type: 'offering',
      uuid: 'offering-uuid',
      name: 'HPC',
      context: 'Org',
      features: ['sync_components'],
      staff_access: false,
      bindings: [{ type: 'offering', uuid: 'offering-uuid' }],
    };

    const clickStep = async (user, label: string) => {
      const item = screen.getByRole('listitem', { name: label });
      await user.click(within(item).getByRole('button'));
    };

    const reachReview = async (user) => {
      mockApi([siteAgent]);
      vi.mocked(personalAccessTokensTemplateTargetsList).mockResolvedValue({
        data: [offeringTarget],
        response: { headers: new Headers({ 'x-result-count': '1' }) },
      } as any);
      vi.mocked(personalAccessTokensCreate).mockResolvedValue({
        data: { token: 'waldur_pat_secret', name: 'Site agent: HPC' },
      } as any);
      renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

      await user.click(await screen.findByLabelText(/Site agent/));
      await user.click(screen.getByRole('button', { name: /Next/ }));

      await screen.findByText('Where will the token be used?');
      await openAndSelectOptionInContainer(
        user,
        screen.getByTestId('wizard-dialog'),
        /HPC/,
      );
      await user.click(screen.getByRole('button', { name: /Next/ }));

      await screen.findByText('What can the token do?');
      await user.click(screen.getByLabelText(/Sync offering components/));
      await user.click(screen.getByRole('button', { name: /Next/ }));

      await screen.findByText('Name and limits');
      expect(screen.getByLabelText(/Token name/)).toHaveValue(
        'Site agent: HPC',
      );
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Review', { selector: 'h4' });
    };

    it('creates the token with the template scopes, bound where the backend says', async () => {
      const user = userEvent.setup();
      await reachReview(user);

      await user.click(
        await screen.findByRole('button', { name: 'Create token' }),
      );

      await waitFor(() =>
        expect(personalAccessTokensCreate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            name: 'Site agent: HPC',
            scopes: [
              'ORDER.APPROVE',
              'OFFERING.MANAGE_AGENT',
              'OFFERING.UPDATE_COMPONENTS',
            ],
            allowed_scopes: offeringTarget.bindings,
            allowed_networks: [],
          }),
        }),
      );
    });

    it('never creates an unrestricted token after the target is cleared from the stepper', async () => {
      const user = userEvent.setup();
      await reachReview(user);
      await screen.findByRole('button', { name: 'Create token' });

      // Back to Purpose through the step indicator; switching purpose clears
      // the target and the generated name.
      await clickStep(user, 'Purpose');
      await user.click(await screen.findByLabelText(/Custom/));
      await user.click(screen.getByLabelText(/Site agent/));

      // Straight to Review: Purpose is answered, so the indicator lets it.
      await clickStep(user, 'Review');

      expect(await screen.findByTestId('review-errors')).toHaveTextContent(
        'Choose where the token is used.',
      );
      const create = screen.getByRole('button', { name: 'Create token' });
      expect(create).toBeDisabled();
      await user.click(create);
      expect(personalAccessTokensCreate).not.toHaveBeenCalled();
    });

    it('asks again for a name and an expiry cleared by a new purpose', async () => {
      const user = userEvent.setup();
      await reachReview(user);
      await screen.findByRole('button', { name: 'Create token' });

      await clickStep(user, 'Purpose');
      await user.click(await screen.findByLabelText(/Custom/));
      await clickStep(user, 'Review');

      const errors = await screen.findByTestId('review-errors');
      expect(errors).toHaveTextContent('Name the token.');
      expect(errors).toHaveTextContent('Choose when the token expires.');
      const create = screen.getByRole('button', { name: 'Create token' });
      expect(create).toBeDisabled();
      await user.click(create);
      expect(personalAccessTokensCreate).not.toHaveBeenCalled();
    });

    it('resets a generated name when the purpose changes', async () => {
      const user = userEvent.setup();
      await reachReview(user);
      await screen.findByRole('button', { name: 'Create token' });

      await clickStep(user, 'Purpose');
      await user.click(await screen.findByLabelText(/Custom/));
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Restrict to specific entities');
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('What can the token do?');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Name and limits');
      expect(screen.getByLabelText(/Token name/)).toHaveValue('');
    });
  });

  it('explains instead of showing an empty wizard when the preset template is unavailable', async () => {
    mockApi([]);
    renderWithProviders(
      <PersonalAccessTokenCreateDialog
        resolve={{
          preset: {
            template: 'site_agent',
            target: {
              type: 'offering',
              uuid: 'offering-uuid',
              name: 'HPC',
              context: 'Org',
              features: [],
              staff_access: false,
              bindings: [{ type: 'offering', uuid: 'offering-uuid' }],
              suggested_username: '',
            },
          },
        }}
      />,
    );
    expect(
      await screen.findByText(
        'You can no longer create this kind of token here.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('What can the token do?'),
    ).not.toBeInTheDocument();
  });

  it('does not leave the Target step with an unfinished restriction', async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

    await screen.findByText('Where will the token be used?');
    await user.click(screen.getByRole('button', { name: /Add binding/ }));

    expect(
      await screen.findByText(
        'Choose a type and an entity for every restriction, or remove it.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
  });

  it('keeps the type and entity chosen for a restriction', async () => {
    // A restriction error used to sit under allowed_scopes, where
    // final-form-arrays keeps the rows' own errors, and choosing a row's
    // type then failed ("Cannot set a numeric property on an object").
    const user = userEvent.setup();
    mockApi([]);
    vi.mocked(
      personalAccessTokensAvailableBindingEntitiesList,
    ).mockResolvedValue({
      data: [
        { type: 'project', uuid: 'p1', name: 'Proj One', context: 'Org A' },
      ],
    } as any);
    renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

    await screen.findByText('Where will the token be used?');
    await user.click(screen.getByRole('button', { name: /Add binding/ }));
    await user.click(screen.getByRole('combobox', { name: 'Type 1' }));
    await user.click(await screen.findByRole('option', { name: 'Project' }));
    await user.click(await screen.findByRole('combobox', { name: 'Entity 1' }));
    await user.click(await screen.findByRole('option', { name: /Proj One/ }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled(),
    );
    expect(
      screen.queryByText(
        'Choose a type and an entity for every restriction, or remove it.',
      ),
    ).not.toBeInTheDocument();
  });

  describe('staff access', () => {
    const staffTarget = {
      type: 'offering',
      uuid: 'offering-uuid',
      name: 'HPC',
      context: 'Org',
      features: ['sync_components'],
      staff_access: true,
      bindings: [],
      suggested_username: '',
    };

    it('warns on Permissions and Review, and creates an unrestricted staff token', async () => {
      const user = userEvent.setup();
      mockApi([siteAgent]);
      vi.mocked(personalAccessTokensCreate).mockResolvedValue({
        data: { token: 'waldur_pat_secret', name: 'Site agent: HPC' },
      } as any);
      renderWithProviders(
        <PersonalAccessTokenCreateDialog
          resolve={{
            preset: {
              template: 'site_agent',
              target: staffTarget,
              offering: { uuid: 'offeringuuid', name: 'HPC' },
            },
          }}
        />,
      );

      await screen.findByText('What can the token do?');
      // Not staff in this test: no dedicated-user choice.
      expect(screen.queryByTestId('token-for-choice')).not.toBeInTheDocument();
      expect(screen.getByTestId('staff-access-warning')).toBeInTheDocument();
      expect(screen.getByTestId('required-scopes')).toHaveTextContent(
        'STAFF.ACCESS',
      );
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Name and limits');
      await user.click(screen.getByRole('button', { name: /Next/ }));

      await screen.findByText('Review', { selector: 'h4' });
      expect(screen.getByTestId('staff-access-warning')).toBeInTheDocument();
      expect(
        screen.getByText('Not restricted (staff access)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Staff access \(STAFF\.ACCESS\)/),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Create token' }));
      await waitFor(() =>
        expect(personalAccessTokensCreate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            scopes: ['ORDER.APPROVE', 'OFFERING.MANAGE_AGENT', 'STAFF.ACCESS'],
            allowed_scopes: [],
          }),
        }),
      );
    });

    it('marks staff-access targets and lists them after scoped ones', async () => {
      const user = userEvent.setup();
      mockApi([siteAgent]);
      vi.mocked(personalAccessTokensTemplateTargetsList).mockResolvedValue({
        data: [
          { ...staffTarget, uuid: 'staff-uuid', name: 'Any cluster' },
          {
            ...staffTarget,
            uuid: 'own-uuid',
            name: 'My cluster',
            staff_access: false,
            bindings: [{ type: 'offering', uuid: 'own-uuid' }],
          },
        ],
        response: { headers: new Headers({ 'x-result-count': '2' }) },
      } as any);
      renderWithProviders(<PersonalAccessTokenCreateDialog resolve={{}} />);

      await user.click(await screen.findByLabelText(/Site agent/));
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Where will the token be used?');
      await user.click(
        within(screen.getByTestId('wizard-dialog')).getByRole('combobox'),
      );

      const options = await screen.findAllByRole('option');
      expect(options[0]).toHaveTextContent('My cluster');
      expect(options[1]).toHaveTextContent('Any cluster');
      expect(
        within(options[1]).getByTestId('staff-access-badge'),
      ).toBeInTheDocument();
      expect(
        within(options[0]).queryByTestId('staff-access-badge'),
      ).not.toBeInTheDocument();
    });
  });

  describe('dedicated agent user for staff', () => {
    const staffTarget = {
      type: 'offering',
      uuid: 'offering-uuid',
      name: 'HPC',
      context: 'Org',
      features: ['sync_components'],
      staff_access: true,
      bindings: [],
      suggested_username: 'site-agent-hpc-0ff3a1',
    };

    const renderPreset = () =>
      renderWithProviders(
        <PersonalAccessTokenCreateDialog
          resolve={{
            preset: {
              template: 'site_agent',
              target: staffTarget,
              offering: { uuid: 'offeringuuid', name: 'HPC' },
            },
          }}
        />,
      );

    beforeEach(() => {
      vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    });

    afterEach(() => {
      vi.mocked(useUser).mockReturnValue({} as any);
    });

    it('defaults to a new user and creates it through agent_user', async () => {
      const user = userEvent.setup();
      mockApi([siteAgent]);
      vi.mocked(personalAccessTokensAgentUser).mockResolvedValue({
        data: {
          token: 'waldur_pat_secret',
          name: 'Site agent: HPC',
          username: 'agent-hpc',
        },
      } as any);
      renderPreset();

      await screen.findByText('What can the token do?');
      expect(screen.getByTestId('token-for-choice')).toBeInTheDocument();
      expect(screen.getByLabelText(/A new dedicated agent user/)).toBeChecked();
      expect(
        screen.getByPlaceholderText('site-agent-hpc-0ff3a1'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('staff-access-warning'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('required-scopes')).not.toHaveTextContent(
        'STAFF.ACCESS',
      );
      await user.click(screen.getByLabelText(/Sync offering components/));
      await user.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Name and limits');
      await user.click(screen.getByRole('button', { name: /Next/ }));

      await screen.findByText('Review', { selector: 'h4' });
      expect(
        screen.getByText(
          'new user site-agent-hpc-0ff3a1, offering manager of HPC',
        ),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Create token' }));

      await waitFor(() =>
        expect(personalAccessTokensAgentUser).toHaveBeenCalledWith({
          body: expect.objectContaining({
            template: 'site_agent',
            target_type: 'offering',
            target_uuid: 'offering-uuid',
            features: ['sync_components'],
            name: 'Site agent: HPC',
            expires_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          }),
        }),
      );
      expect(personalAccessTokensCreate).not.toHaveBeenCalled();
      expect(useModal().openDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: expect.objectContaining({ username: 'agent-hpc' }),
        }),
      );
    });

    it('lets staff choose themselves with full staff access, behind the warning', async () => {
      const user = userEvent.setup();
      mockApi([siteAgent]);
      renderPreset();

      await screen.findByText('What can the token do?');
      await user.click(screen.getByLabelText(/Me, with full staff access/));
      expect(screen.getByTestId('staff-access-warning')).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Username of the new user/),
      ).not.toBeInTheDocument();
    });
  });
});
