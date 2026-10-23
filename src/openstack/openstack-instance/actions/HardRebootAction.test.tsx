import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackInstancesHardReboot } from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { HardRebootAction } from './HardRebootAction';

// Capture the config handed to useManagedMutation (the hook itself is covered by
// its own test) so we can assert which request the action sends.
const { captured } = vi.hoisted(() => ({ captured: { value: null as any } }));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate: vi.fn() };
  },
}));

const renderAction = (state: string, runtime_state: string) =>
  renderWithProviders(
    inActionsMenu(
      <HardRebootAction
        resource={
          {
            uuid: 'instance-uuid',
            name: 'web-1',
            state,
            runtime_state,
            project_uuid: 'project-uuid',
            customer_uuid: 'customer-uuid',
          } as any
        }
        refetch={vi.fn()}
      />,
    ),
  );

const isDisabled = () =>
  screen.getByTestId('action-item-content').classList.contains('opacity-50');

describe('HardRebootAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it.each(['ACTIVE', 'ERROR', 'PAUSED', 'SUSPENDED', 'REBOOT'])(
    'allows a hard reboot from %s',
    (runtimeState) => {
      renderAction('OK', runtimeState);

      expect(screen.getByText('Hard reboot')).toBeInTheDocument();
      expect(isDisabled()).toBe(false);
    },
  );

  it('allows a hard reboot of an erred instance', () => {
    renderAction('ERRED', 'ERROR');

    expect(isDisabled()).toBe(false);
  });

  it('sends a hard reboot for the instance', () => {
    renderAction('OK', 'ACTIVE');

    captured.value.mutationFn();

    expect(openstackInstancesHardReboot).toHaveBeenCalledWith({
      path: { uuid: 'instance-uuid' },
    });
  });

  it('points a stopped instance at Start', () => {
    renderAction('OK', 'SHUTOFF');

    expect(isDisabled()).toBe(true);
    expect(
      screen.getByText('Instance is stopped. Start it instead.'),
    ).toBeInTheDocument();
  });

  it.each([
    ['OK', 'HARD_REBOOT'],
    ['OK', 'RESCUE'],
    ['ERRED', 'SHUTOFF'],
    ['UPDATING', 'ACTIVE'],
  ])('disables a hard reboot when state is %s and runtime is %s', (s, r) => {
    renderAction(s, r);

    expect(isDisabled()).toBe(true);
    expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
  });

  it('disables a hard reboot for a user without power permission', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [],
    } as any);

    renderAction('OK', 'ACTIVE');

    expect(isDisabled()).toBe(true);
    expect(
      screen.getByText(
        'You do not have permission to manage power operations for this instance.',
      ),
    ).toBeInTheDocument();
  });
});
