import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';

import { SetPanelChairButton } from './SetPanelChairButton';

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
    <SetPanelChairButton
      permission={permission}
      call={call}
      refetch={refetch}
    />,
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

  it('sets the member as chair via a call PATCH', async () => {
    renderButton({ uuid: 'call-1', panel_chair_uuid: '' });
    await userEvent.click(screen.getByText('Set as panel chair'));
    expect(mutate).toHaveBeenCalled();
    captured.value.mutationFn();
    expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
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
    captured.value.mutationFn();
    expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith({
      path: { uuid: 'call-1' },
      body: { panel_chair: null },
    });
    expect(captured.value.refetch).toBe(refetch);
  });
});
