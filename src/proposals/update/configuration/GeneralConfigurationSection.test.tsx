import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import {
  GeneralConfigurationSection,
  exclusiveDurationPolicy,
  formatComplianceChecklist,
  formatOrderAuthorUser,
  normalizeComplianceChecklist,
  normalizeOrderAuthorUser,
  validateFixedDuration,
} from './GeneralConfigurationSection';

describe('exclusiveDurationPolicy', () => {
  it('clears the fixed duration when a list of lengths is set', () => {
    expect(
      exclusiveDurationPolicy({ allowed_duration_months: [3, 6] }),
    ).toEqual({ fixed_duration_in_days: null });
  });

  it('clears the list when a fixed duration is set', () => {
    expect(exclusiveDurationPolicy({ fixed_duration_in_days: 365 })).toEqual({
      allowed_duration_months: [],
    });
  });

  it('leaves other edits and cleared values alone', () => {
    expect(exclusiveDurationPolicy({ allowed_duration_months: [] })).toEqual(
      {},
    );
    expect(exclusiveDurationPolicy({ fixed_duration_in_days: null })).toEqual(
      {},
    );
    expect(exclusiveDurationPolicy({ order_author: 'applicant' })).toEqual({});
  });
});

describe('validateFixedDuration', () => {
  it('accepts an empty value, which clears the fixed duration', () => {
    expect(validateFixedDuration(null)).toBeUndefined();
    expect(validateFixedDuration('')).toBeUndefined();
    expect(validateFixedDuration(undefined)).toBeUndefined();
  });

  it('accepts a positive whole number, including the string form', () => {
    expect(validateFixedDuration(1)).toBeUndefined();
    expect(validateFixedDuration('45')).toBeUndefined();
  });

  it('rejects values the backend would refuse', () => {
    expect(validateFixedDuration(0)).toBeTruthy();
    expect(validateFixedDuration(-5)).toBeTruthy();
    expect(validateFixedDuration('1.5')).toBeTruthy();
    expect(validateFixedDuration('abc')).toBeTruthy();
  });
});

describe('formatOrderAuthorUser', () => {
  const call = { order_author_user_name: 'Grants Office' };

  it('turns the stored UUID into an option the picker can display', () => {
    expect(formatOrderAuthorUser('abc123', call)).toEqual({
      uuid: 'abc123',
      full_name: 'Grants Office',
    });
  });

  it('keeps a freshly picked user as it is', () => {
    const picked = { uuid: 'def456', full_name: 'Jane Doe' };
    expect(formatOrderAuthorUser(picked, call)).toBe(picked);
  });

  it('shows nothing selected when no contact is set', () => {
    expect(formatOrderAuthorUser(null, call)).toBeNull();
    expect(formatOrderAuthorUser('', call)).toBeNull();
    expect(formatOrderAuthorUser(undefined, call)).toBeNull();
  });
});

describe('normalizeOrderAuthorUser', () => {
  it('submits the UUID of a picked user', () => {
    expect(normalizeOrderAuthorUser({ uuid: 'def456' })).toBe('def456');
  });

  it('passes an unchanged UUID through', () => {
    expect(normalizeOrderAuthorUser('abc123')).toBe('abc123');
  });

  it('submits null for a cleared contact', () => {
    expect(normalizeOrderAuthorUser(null)).toBeNull();
    expect(normalizeOrderAuthorUser(undefined)).toBeNull();
  });
});

describe('formatComplianceChecklist', () => {
  const call = { compliance_checklist_name: 'Administrative Eligibility' };

  it('turns the stored UUID into an option the picker can display', () => {
    expect(formatComplianceChecklist('cb2', call)).toEqual({
      uuid: 'cb2',
      name: 'Administrative Eligibility',
    });
  });

  it('keeps a freshly picked checklist as it is', () => {
    const picked = { uuid: 'cb1', name: 'Research Ethics' };
    expect(formatComplianceChecklist(picked, call)).toBe(picked);
  });

  it('shows nothing selected when no checklist is set', () => {
    expect(formatComplianceChecklist(null, call)).toBeNull();
    expect(formatComplianceChecklist(undefined, call)).toBeNull();
  });

  it('falls back to the UUID when the call carries no checklist name', () => {
    expect(
      formatComplianceChecklist('cb2', { compliance_checklist_name: null }),
    ).toEqual({ uuid: 'cb2', name: 'cb2' });
  });
});

describe('normalizeComplianceChecklist', () => {
  it('submits the UUID of a picked checklist, not the option object', () => {
    expect(
      normalizeComplianceChecklist({ uuid: 'cb2', name: 'Administrative' }),
    ).toBe('cb2');
  });

  it('passes an unchanged UUID through', () => {
    expect(normalizeComplianceChecklist('cb2')).toBe('cb2');
  });

  it('submits null for a cleared checklist', () => {
    expect(normalizeComplianceChecklist(null)).toBeNull();
    expect(normalizeComplianceChecklist(undefined)).toBeNull();
    expect(normalizeComplianceChecklist('')).toBeNull();
  });
});

// The settings are grouped in tabs; only the open tab is mounted.
const openTab = (name: string) =>
  userEvent.setup().click(screen.getByRole('tab', { name }));

describe('GeneralConfigurationSection compliance checklist', () => {
  const call = {
    uuid: 'call-uuid',
    customer_uuid: 'customer-uuid',
    evaluation_start: 'on_submission',
    order_author: 'applicant',
    has_proposals: false,
    compliance_checklist: null,
    compliance_checklist_name: null,
  } as any;

  const openChecklistDialog = async (user, callProps) => {
    renderWithProviders(
      <GeneralConfigurationSection call={callProps} refetch={vi.fn()} />,
    );
    await openTab('Compliance');
    await user.click(screen.getByTestId('edit-compliance_checklist'));
    const { openDialog } = useModal();
    const [, dialogProps] = vi.mocked(openDialog).mock.lastCall as any;
    renderWithProviders(<EditFieldDialog {...dialogProps} />);
  };

  it('saves the picked checklist as its UUID', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsAvailableComplianceChecklistsList,
    ).mockResolvedValue(
      mockListResponse([{ uuid: 'cb2', name: 'Administrative Eligibility' }]),
    );
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    await openChecklistDialog(user, call);

    await openAndSelectOption(
      user,
      /^Compliance checklist/,
      'Administrative Eligibility',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { compliance_checklist: 'cb2' },
      });
    });
  });

  it('opens on the current checklist and clears it as null', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsAvailableComplianceChecklistsList,
    ).mockResolvedValue(mockListResponse([]));
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    await openChecklistDialog(user, {
      ...call,
      compliance_checklist: 'cb2',
      compliance_checklist_name: 'Administrative Eligibility',
    });

    // The stored UUID is shown as the checklist's name, not as an empty box.
    const picker = getSelectByLabel(/^Compliance checklist/);
    expect(
      within(picker).getAllByText('Administrative Eligibility').length,
    ).toBeGreaterThan(0);

    await user.click(within(picker).getByRole('combobox'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { compliance_checklist: null },
      });
    });
  });
});

describe('GeneralConfigurationSection evaluation start', () => {
  const call = {
    uuid: 'call-uuid',
    customer_uuid: 'customer-uuid',
    evaluation_start: 'on_submission',
    order_author: 'applicant',
    has_proposals: true,
  } as any;

  it('shows when evaluation starts', async () => {
    renderWithProviders(
      <GeneralConfigurationSection
        call={{ ...call, evaluation_start: 'at_cutoff' }}
        refetch={vi.fn()}
      />,
    );
    await openTab('Evaluation');
    expect(screen.getByText('Evaluation starts')).toBeInTheDocument();
    expect(screen.getByText('At the round cut-off')).toBeInTheDocument();
  });

  it('saves the chosen evaluation start on the call', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <GeneralConfigurationSection call={call} refetch={refetch} />,
    );
    await openTab('Evaluation');

    await user.click(screen.getByTestId('edit-evaluation_start'));
    const { openDialog } = useModal();
    const [, dialogProps] = vi.mocked(openDialog).mock.lastCall as any;
    renderWithProviders(<EditFieldDialog {...dialogProps} />);

    await openAndSelectOption(
      user,
      /^Evaluation starts/,
      'At the round cut-off',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { evaluation_start: 'at_cutoff' },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});

describe('GeneralConfigurationSection draft carry-over', () => {
  const call = {
    uuid: 'call-uuid',
    customer_uuid: 'customer-uuid',
    evaluation_start: 'on_submission',
    order_author: 'applicant',
    has_proposals: false,
    carry_over_drafts: false,
  } as any;

  it('shows whether drafts carry over to the next round', async () => {
    renderWithProviders(
      <GeneralConfigurationSection
        call={{ ...call, carry_over_drafts: true }}
        refetch={vi.fn()}
      />,
    );
    await openTab('Decisions and rounds');
    expect(
      screen.getByText('Carry unsubmitted drafts over to the next round'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('edit-carry_over_drafts')).toBeInTheDocument();
  });

  it('saves the carry-over setting on the call', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <GeneralConfigurationSection call={call} refetch={refetch} />,
    );
    await openTab('Decisions and rounds');

    await user.click(screen.getByTestId('edit-carry_over_drafts'));
    const { openDialog } = useModal();
    const [, dialogProps] = vi.mocked(openDialog).mock.lastCall as any;
    renderWithProviders(<EditFieldDialog {...dialogProps} />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { carry_over_drafts: true },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});

describe('GeneralConfigurationSection groups and search', () => {
  const call = {
    uuid: 'call-uuid',
    customer_uuid: 'customer-uuid',
    evaluation_start: 'on_submission',
    order_author: 'applicant',
    has_proposals: false,
  } as any;

  it('groups the settings in tabs', () => {
    renderWithProviders(
      <GeneralConfigurationSection call={call} refetch={vi.fn()} />,
    );
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Duration',
      'Evaluation',
      'Decisions and rounds',
      'Compliance',
      'Applicants',
      'Orders',
    ]);
  });

  it('finds a setting by its name or description, in whichever tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <GeneralConfigurationSection call={call} refetch={vi.fn()} />,
    );
    await user.type(screen.getByRole('searchbox'), 'conflict-of-interest');
    expect(
      await screen.findByText('Conflict-of-interest declaration'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Evaluation starts')).not.toBeInTheDocument();
  });
});
