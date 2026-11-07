import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalRowActions } from './ProposalRowActions';

const assignment = vi.hoisted(() => ({
  value: { canManage: false, blocker: null as string | null },
}));
vi.mock('./create/utils', () => ({
  useReviewerAssignment: () => assignment.value,
  CreateManualAssignmentDialog: () => null,
}));
vi.mock('./ReviewProposalMyselfAction', () => ({
  ReviewProposalMyselfAction: () => null,
}));
vi.mock('./DownloadProposalPdfAction', () => ({
  DownloadProposalPdfAction: () => null,
}));

const row = {
  uuid: 'p1',
  name: 'Lattice QCD',
  call_uuid: 'call-1',
  call_managing_organisation_uuid: 'org-1',
};

const open = async () => {
  renderWithProviders(<ProposalRowActions row={row} refetch={vi.fn()} />);
  await userEvent.setup().click(screen.getByRole('button'));
};

describe('ProposalRowActions', () => {
  it("offers the call's managers to message the applicants", async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
      permissions: [],
    } as any);
    await open();
    expect(
      await screen.findByRole('menuitem', { name: /Message the applicants/ }),
    ).toBeInTheDocument();
  });

  it('offers to assign a reviewer to a proposal that can take one', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'manager',
      is_staff: false,
      permissions: [],
    } as any);
    assignment.value = { canManage: true, blocker: null };
    await open();
    const item = await screen.findByRole('menuitem', {
      name: /Assign reviewer/,
    });
    expect(item).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('says why a proposal cannot take a reviewer now', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'manager',
      is_staff: false,
      permissions: [],
    } as any);
    assignment.value = {
      canManage: true,
      blocker: 'The proposal is not submitted yet.',
    };
    await open();
    const item = await screen.findByRole('menuitem', {
      name: /Assign reviewer/,
    });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText('The proposal is not submitted yet.'),
    ).toBeInTheDocument();
  });

  it('offers no assignment to someone who does not manage reviews', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'applicant',
      is_staff: false,
      permissions: [],
    } as any);
    assignment.value = { canManage: false, blocker: null };
    await open();
    expect(
      screen.queryByRole('menuitem', { name: /Assign reviewer/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps it from someone who cannot manage the call', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'applicant',
      is_staff: false,
      permissions: [],
    } as any);
    await open();
    expect(
      screen.queryByRole('menuitem', { name: /Message the applicants/ }),
    ).not.toBeInTheDocument();
  });
});
