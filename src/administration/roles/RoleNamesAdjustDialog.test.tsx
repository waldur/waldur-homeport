import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rolesList, rolesUpdateDescriptionsUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { RoleNamesAdjustDialog } from './RoleNamesAdjustDialog';
import { getRoles } from './utils';

vi.mock('./utils');

describe('RoleNamesAdjustDialog', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.defaultLanguage = 'en';
    vi.mocked(getRoles).mockResolvedValue([]);
    vi.mocked(rolesUpdateDescriptionsUpdate).mockResolvedValue(undefined);
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'member-uuid',
          name: 'PROPOSAL.MEMBER',
          content_type: 'proposal',
          is_system_role: true,
          description_en: 'Proposal member',
        },
        {
          uuid: 'manager-uuid',
          name: 'PROPOSAL.MANAGER',
          content_type: 'proposal',
          is_system_role: true,
          description_en: 'Proposal manager',
        },
        {
          uuid: 'admin-uuid',
          name: 'PROPOSAL.ADMIN',
          content_type: 'proposal',
          is_system_role: true,
          description_en: 'Proposal administrator',
        },
        {
          uuid: 'project-uuid',
          name: 'PROJECT.MANAGER',
          content_type: 'project',
          is_system_role: true,
          description_en: 'Project manager',
        },
      ]),
    );
  });

  const PROPOSAL_DESCRIPTION = 'For deployments that run calls for proposals.';

  const open = async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleNamesAdjustDialog resolve={{ refetch }} />);
    await screen.findByText(PROPOSAL_DESCRIPTION);
    return user;
  };

  // react-select: open the control by its shown value, then pick an option.
  const choose = async (user, shown: string, option: string) => {
    await user.click(screen.getByText(shown));
    await user.click(await screen.findByText(option));
  };

  it('opens on the proposal roles and the preset their names match', async () => {
    await open();

    // The selected values of the two dropdowns.
    expect(screen.getByText('Proposal')).toBeInTheDocument();
    expect(screen.getByText('Calls for proposals')).toBeInTheDocument();
    expect(rolesList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ is_system_role: true }),
      }),
    );
  });

  it('does not save a blank name', async () => {
    const user = await open();
    await user.click(screen.getByText('Next'));

    await user.clear(await screen.findByDisplayValue('Proposal member'));
    await user.click(screen.getByText('Save'));

    expect(
      await screen.findByText('This field is required.'),
    ).toBeInTheDocument();
    expect(rolesUpdateDescriptionsUpdate).not.toHaveBeenCalled();
  });

  it('tries every role and refreshes the names when one save fails', async () => {
    vi.mocked(rolesUpdateDescriptionsUpdate).mockImplementation(
      ({ path }) =>
        (path.uuid === 'manager-uuid'
          ? Promise.reject(new Error('boom'))
          : Promise.resolve(undefined)) as any,
    );
    const user = await open();

    await choose(user, 'Calls for proposals', 'Marketplace only');
    await user.click(screen.getByText('Next'));
    await screen.findByDisplayValue('Lead applicant');
    await user.click(screen.getByText('Save'));

    await vi.waitFor(() =>
      expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledTimes(3),
    );
    expect(getRoles).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
  });

  it('keeps names edited for a scope after visiting another one', async () => {
    const user = await open();
    await user.click(screen.getByText('Next'));
    const member = await screen.findByDisplayValue('Proposal member');
    await user.clear(member);
    await user.type(member, 'Co-worker');

    await user.click(screen.getByText('Back'));
    await choose(user, 'Proposal', 'Project');
    await choose(user, 'Project', 'Proposal');
    await user.click(screen.getByText('Next'));

    expect(await screen.findByDisplayValue('Co-worker')).toBeInTheDocument();
  });

  it('fills the names from the chosen preset and saves them', async () => {
    const user = await open();

    await choose(user, 'Calls for proposals', 'Marketplace only');
    await user.click(screen.getByText('Next'));

    expect(
      await screen.findByDisplayValue('Lead applicant'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('New name')).toHaveLength(3);
    expect(screen.getByDisplayValue('Co-applicant')).toBeInTheDocument();
    expect(screen.queryByText('PROJECT.MANAGER')).not.toBeInTheDocument();

    await user.click(screen.getByText('Save'));

    expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledWith({
      path: { uuid: 'manager-uuid' },
      body: { description_en: 'Lead applicant' },
    });
    expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledWith({
      path: { uuid: 'member-uuid' },
      body: { description_en: 'Team member' },
    });
    expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledWith({
      path: { uuid: 'admin-uuid' },
      body: { description_en: 'Co-applicant' },
    });
  });

  it('lists the roles from most to least access', async () => {
    const user = await open();
    await user.click(screen.getByText('Next'));
    await screen.findByDisplayValue('Proposal manager');

    const codes = screen
      .getAllByText(/^PROPOSAL\./)
      .map((element) => element.textContent?.replace(/\W*$/, ''));
    expect(codes).toEqual([
      'PROPOSAL.MANAGER',
      'PROPOSAL.ADMIN',
      'PROPOSAL.MEMBER',
    ]);
  });

  it('saves only changed names and keeps edits when going back', async () => {
    const user = await open();
    await user.click(screen.getByText('Next'));

    const member = await screen.findByDisplayValue('Proposal member');
    await user.clear(member);
    await user.type(member, 'Co-worker');
    await user.click(screen.getByText('Back'));
    await user.click(await screen.findByText('Next'));

    expect(await screen.findByDisplayValue('Co-worker')).toBeInTheDocument();

    await user.click(screen.getByText('Save'));

    expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledTimes(1);
    expect(rolesUpdateDescriptionsUpdate).toHaveBeenCalledWith({
      path: { uuid: 'member-uuid' },
      body: { description_en: 'Co-worker' },
    });
  });

  it('says so when a scope has no presets', async () => {
    const user = await open();

    await choose(user, 'Proposal', 'Project');

    expect(
      screen.getByText(
        'No presets are available for this scope. You can edit the names yourself in the next step.',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByText('Next'));
    expect(
      await screen.findByDisplayValue('Project manager'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Preset:/)).not.toBeInTheDocument();
  });
});
