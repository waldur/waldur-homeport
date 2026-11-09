import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { RoleEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { PanelChairBadge, SetPanelChairButton } from './SetPanelChairButton';

const { captured, mutate } = vi.hoisted(() => ({
  captured: { value: null as any },
  mutate: vi.fn(),
}));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate };
  },
}));

const member = {
  user_uuid: 'user-1',
  role_name: RoleEnum.CALL_PANEL_MEMBER,
} as any;

const renderButton = (call, permission = member) => {
  const refetch = vi.fn();
  renderWithProviders(
    inActionsMenu(
      <SetPanelChairButton
        permission={permission}
        call={call}
        refetch={refetch}
      />,
    ),
  );
  return { refetch };
};

describe('SetPanelChairButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
  });

  it('is hidden for members without the panel member role', () => {
    renderButton(
      { uuid: 'call-1', panel_chair_uuid: '' },
      {
        ...member,
        role_name: RoleEnum.CALL_MANAGER,
      },
    );
    expect(screen.queryByText('Set as panel chair')).not.toBeInTheDocument();
  });

  const patched = () => {
    const [body] = mutate.mock.calls[mutate.mock.calls.length - 1];
    captured.value.mutationFn(body);
    return vi.mocked(proposalProtectedCallsPartialUpdate).mock.calls[0][0];
  };

  it('sets the member as chair via a call PATCH', async () => {
    renderButton({ uuid: 'call-1', panel_chair_uuid: '' });
    await userEvent.click(screen.getByText('Set as panel chair'));
    expect(patched()).toEqual({
      path: { uuid: 'call-1' },
      body: { panel_chair: 'user-1' },
    });
  });

  it('offers to unset when the member already chairs and clears the pointer', async () => {
    const { refetch } = renderButton({
      uuid: 'call-1',
      panel_chair_uuid: 'user-1',
    });
    await userEvent.click(screen.getByText('Unset panel chair'));
    expect(patched()).toEqual({
      path: { uuid: 'call-1' },
      body: { panel_chair: null },
    });
    expect(captured.value.refetch).toBe(refetch);
  });

  it('sets the member as vice-chair', async () => {
    renderButton({ uuid: 'call-1', panel_chair_uuid: 'user-2' });
    await userEvent.click(screen.getByText('Set as vice-chair'));
    expect(patched()).toEqual({
      path: { uuid: 'call-1' },
      body: { panel_vice_chair: 'user-1' },
    });
  });

  it('moves the chair to the vice-chair seat in one PATCH', async () => {
    renderButton({ uuid: 'call-1', panel_chair_uuid: 'user-1' });
    await userEvent.click(screen.getByText('Set as vice-chair'));
    expect(patched()).toEqual({
      path: { uuid: 'call-1' },
      body: { panel_vice_chair: 'user-1', panel_chair: null },
    });
  });

  it('unsets the vice-chair', async () => {
    renderButton({
      uuid: 'call-1',
      panel_chair_uuid: '',
      panel_vice_chair_uuid: 'user-1',
    });
    await userEvent.click(screen.getByText('Unset vice-chair'));
    expect(patched()).toEqual({
      path: { uuid: 'call-1' },
      body: { panel_vice_chair: null },
    });
  });
});

describe('PanelChairBadge', () => {
  const call = { panel_chair_uuid: 'chair', panel_vice_chair_uuid: 'vice' };

  it.each([
    ['chair', 'Chair'],
    ['vice', 'Vice-chair'],
  ])('marks the panel-member row of %s', (user, label) => {
    renderWithProviders(
      <PanelChairBadge
        row={{ user_uuid: user, role_name: RoleEnum.CALL_PANEL_MEMBER }}
        call={call}
      />,
    );
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("leaves the same person's reviewer row unmarked", () => {
    renderWithProviders(
      <PanelChairBadge
        row={{ user_uuid: 'chair', role_name: RoleEnum.CALL_REVIEWER }}
        call={call}
      />,
    );
    expect(screen.queryByText('Chair')).not.toBeInTheDocument();
  });

  it('marks nobody else', () => {
    renderWithProviders(
      <PanelChairBadge
        row={{ user_uuid: 'other', role_name: RoleEnum.CALL_PANEL_MEMBER }}
        call={call}
      />,
    );
    expect(screen.queryByText(/chair/i)).not.toBeInTheDocument();
  });
});
