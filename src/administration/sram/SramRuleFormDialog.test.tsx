import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  sramProjectRulesCreate,
  sramProjectRulesUpdate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { SramRuleFormDialog } from './SramRuleFormDialog';

const memberRole = {
  uuid: 'member-role-uuid',
  name: 'PROJECT.SRAM_MEMBER',
  description: 'SRAM project member',
  content_type: 'project',
  is_active: true,
  permissions: [],
};

const existingRule = {
  url: 'http://example.com/api/sram-project-rules/rule-uuid/',
  uuid: 'rule-uuid',
  name: 'Research workspaces',
  is_active: true,
  source_kind: 'group',
  labels: ['tag_ufra'],
  group_short_name_patterns: ['compute-*'],
  project_field: 'backend_id',
  project_match: 'prefix',
  project_pattern: '{co_external_id}_',
  project_role: memberRole.uuid,
  project_role_name: memberRole.name,
  project_role_description: memberRole.description,
  created: '',
  modified: '',
} as any;

const renderDialog = (resolve: any = { refetch: vi.fn() }) =>
  renderWithProviders(<SramRuleFormDialog resolve={resolve} />);

const pickRole = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByLabelText(/Project role/));
  await user.click(await screen.findByText('SRAM project member'));
};

const addTag = async (
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  value: string,
) => {
  await user.type(screen.getByLabelText(label), value);
  await user.keyboard('{Enter}');
};

const submitButton = (name: RegExp) => screen.getByRole('button', { name });

let savedRoles;

describe('SramRuleFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedRoles = ENV.roles;
    ENV.roles = [...ENV.roles, memberRole as any];
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('creates a rule with the defaults and the picked role', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(sramProjectRulesCreate).mockResolvedValue({
      data: { uuid: 'new' },
    } as any);

    renderDialog({ refetch });
    await screen.findByText('Add SRAM project rule');

    await user.type(screen.getByLabelText(/^Name/), 'Research');
    await addTag(user, /^Labels/, 'tag_ufra');
    await pickRole(user);
    await user.click(submitButton(/^Create$/));

    await waitFor(() =>
      expect(sramProjectRulesCreate).toHaveBeenCalledWith({
        body: {
          name: 'Research',
          is_active: true,
          source_kind: 'co',
          labels: ['tag_ufra'],
          group_short_name_patterns: [],
          project_field: 'backend_id',
          project_match: 'prefix',
          project_pattern: '{co_external_id}_',
          project_role: memberRole.uuid,
        },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('hints that group short names need a group source', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('Add SRAM project rule');

    expect(
      screen.getByText(
        'Applies only when the source is "Group" or "Collaboration or group".',
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Name/), 'Groups');
    await pickRole(user);
    await addTag(user, /Group short names/, 'compute-*');
    await user.tab();

    expect(
      await screen.findByText(/Group short names apply only to groups/),
    ).toBeInTheDocument();
    expect(submitButton(/^Create$/)).toBeDisabled();
    expect(sramProjectRulesCreate).not.toHaveBeenCalled();
  });

  it('shows the server validation errors under their fields', async () => {
    const user = userEvent.setup();
    vi.mocked(sramProjectRulesUpdate).mockRejectedValue({
      project_pattern: ['Invalid regular expression: missing ), unterminated.'],
    });

    renderDialog({ refetch: vi.fn(), rule: existingRule });
    await screen.findByText('Edit SRAM project rule');

    await user.click(submitButton(/^Save$/));

    await waitFor(() =>
      expect(sramProjectRulesUpdate).toHaveBeenCalledWith({
        path: { uuid: 'rule-uuid' },
        body: expect.objectContaining({
          source_kind: 'group',
          labels: ['tag_ufra'],
          group_short_name_patterns: ['compute-*'],
          project_role: memberRole.uuid,
        }),
      }),
    );
    expect(
      await screen.findByText(
        'Invalid regular expression: missing ), unterminated.',
      ),
    ).toBeInTheDocument();
  });

  it('starts a duplicate as a new rule named after the original', async () => {
    const user = userEvent.setup();
    vi.mocked(sramProjectRulesCreate).mockResolvedValue({ data: {} } as any);

    renderDialog({ refetch: vi.fn(), rule: existingRule, isDuplicate: true });
    await screen.findByText('Duplicate SRAM project rule');
    expect(screen.getByLabelText(/^Name/)).toHaveValue(
      'Research workspaces (copy)',
    );

    await user.click(submitButton(/^Create$/));

    await waitFor(() =>
      expect(sramProjectRulesCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Research workspaces (copy)',
          group_short_name_patterns: ['compute-*'],
        }),
      }),
    );
    expect(sramProjectRulesUpdate).not.toHaveBeenCalled();
  });
});
