import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CallEligibilitySection } from './CallEligibilitySection';

const mockCall = {
  uuid: 'call-uuid',
  state: 'active',
  user_email_patterns: ['@university.example'],
  user_affiliations: ['faculty'],
  user_identity_sources: [],
  user_nationalities: [],
  user_organization_types: [],
  user_assurance_levels: [],
} as any;

const renderSection = (props: Record<string, any> = {}) =>
  renderWithProviders(
    <CallEligibilitySection
      call={props.call ?? mockCall}
      refetch={props.refetch ?? vi.fn()}
      isReadOnly={props.isReadOnly}
    />,
  );

const ALL_ELIGIBILITY_ATTRIBUTES = [
  'affiliations',
  'identity_source',
  'nationality',
  'nationalities',
  'organization_type',
  'eduperson_assurance',
];

const setEnabledAttributes = (attributes: string[]) => {
  (ENV.plugins.WALDUR_CORE as any).ENABLED_USER_PROFILE_ATTRIBUTES = attributes;
};

describe('CallEligibilitySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    setEnabledAttributes(ALL_ELIGIBILITY_ATTRIBUTES);
  });

  it('renders every eligibility field the backend supports', () => {
    renderSection();

    expect(screen.getByText('Email patterns')).toBeInTheDocument();
    expect(screen.getByText('User affiliations')).toBeInTheDocument();
    expect(screen.getByText('Identity sources')).toBeInTheDocument();
    expect(screen.getByText('Nationalities')).toBeInTheDocument();
    expect(screen.getByText('Organization types')).toBeInTheDocument();
    expect(screen.getByText('Assurance levels')).toBeInTheDocument();
  });

  it('shows configured values and marks the rest unrestricted', () => {
    renderSection();

    expect(screen.getByText('faculty')).toBeInTheDocument();
    expect(screen.getByText('@university.example')).toBeInTheDocument();
    expect(screen.getAllByText('No restrictions configured')).toHaveLength(4);
  });

  it('patches the protected call with a value picked from the vocabulary', async () => {
    const user = userEvent.setup();
    const { openDialog } = useModal();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: { ...mockCall, user_affiliations: ['faculty', 'student'] },
    } as any);

    renderSection();

    const row = screen
      .getByText('User affiliations')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('tr') as HTMLElement;
    await user.click(within(row).getByTestId('edit-user_affiliations'));

    const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
    renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(await screen.findByRole('option', { name: 'Student' }));

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { user_affiliations: ['faculty', 'student'] },
      }),
    );
  });

  // Identity providers routinely send scoped affiliations, which no vocabulary
  // can enumerate -- the control has to accept them as typed.
  it('accepts a value outside the vocabulary', async () => {
    const user = userEvent.setup();
    const { openDialog } = useModal();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: mockCall,
    } as any);

    renderSection();

    const row = screen
      .getByText('User affiliations')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('tr') as HTMLElement;
    await user.click(within(row).getByTestId('edit-user_affiliations'));

    const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
    renderWithProviders(<EditFieldDialog resolve={resolveProps} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'faculty@ut.ee');
    await user.click(
      await screen.findByRole('option', { name: /faculty@ut\.ee/ }),
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { user_affiliations: ['faculty', 'faculty@ut.ee'] },
      }),
    );
  });

  // An archived call is frozen server-side, and once #328 lands isReadOnly also
  // covers a user without UPDATE_CALL. Either way the rows must stay locked.
  it('locks every row when the call cannot be edited', () => {
    renderSection({
      call: { ...mockCall, state: 'archived' },
      isReadOnly: true,
    });

    const editButtons = screen.getAllByTestId(/^edit-user_/);
    expect(editButtons).toHaveLength(6);
    editButtons.forEach((button) => expect(button).toBeDisabled());
  });
  // A deployment that does not collect an attribute can never match on it, so
  // offering the restriction would only invite a call nobody can apply to.
  describe('deployment attribute gate', () => {
    it('drops a row whose attribute the deployment does not collect', () => {
      setEnabledAttributes(
        ALL_ELIGIBILITY_ATTRIBUTES.filter(
          (attribute) => attribute !== 'eduperson_assurance',
        ),
      );

      renderSection();

      expect(screen.queryByText('Assurance levels')).not.toBeInTheDocument();
      expect(screen.getByText('User affiliations')).toBeInTheDocument();
    });

    // The backend keeps evaluating a stored restriction whatever the
    // deployment collects, so hiding this row would leave every applicant
    // rejected from behind it.
    it('keeps a disabled attribute that still carries a restriction, with a warning', () => {
      setEnabledAttributes([]);

      renderSection({
        call: { ...mockCall, user_assurance_levels: ['IAP Medium'] },
      });

      const row = screen
        .getByText('Assurance levels')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('tr') as HTMLElement;
      expect(row).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(row.querySelector('.text-warning')).toBeInTheDocument();
    });

    it('always offers email patterns, since email is a core attribute', () => {
      setEnabledAttributes([]);

      renderSection();

      expect(screen.getByText('Email patterns')).toBeInTheDocument();
      expect(screen.queryByText('Nationalities')).not.toBeInTheDocument();
    });
  });
});
