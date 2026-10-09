import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { useNotify } from '@/store/notify';

import { CallSettingsMenu } from './CallSettingsMenu';

const setActiveMediaDevice = vi.fn<(id: string) => Promise<void>>();

vi.mock('@livekit/components-react', () => ({
  useMediaDeviceSelect: () => ({
    devices: [
      { deviceId: 'built-in', label: 'Built-in microphone' },
      { deviceId: 'headset', label: 'Headset' },
    ],
    activeDeviceId: 'built-in',
    setActiveMediaDevice,
  }),
}));

const OpenButton = ({
  onOpen,
}: {
  onOpen: (open: ReturnType<typeof useDrawer>['openDrawer']) => void;
}) => {
  const { openDrawer } = useDrawer();
  onOpen(openDrawer);
  return null;
};

/**
 * MatrixCallHost's shape: the call view is owned by a React tree outside the
 * drawer and appended into a slot inside it, so the drawer only knows a click
 * belongs to the call by DOM containment.
 */
const renderDockedCall = () => {
  const callView = document.createElement('div');

  const CallHost = () =>
    createPortal(<CallSettingsMenu container={null} />, callView, 'call-view');

  const DockSlot = () => {
    const slotRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      slotRef.current?.appendChild(callView);
    }, []);
    return <div ref={slotRef} data-testid="dock-slot" />;
  };

  let openDrawer!: ReturnType<typeof useDrawer>['openDrawer'];
  render(
    <DrawerProvider>
      <OpenButton onOpen={(fn) => (openDrawer = fn)} />
      <CallHost />
      <DrawerRoot />
    </DrawerProvider>,
  );
  openDrawer(DockSlot, { title: 'Team chat' });
};

const domError = (name: string) => Object.assign(new Error(''), { name });

/** Open the menu and pick Headset in the select at `index` (mic, speaker, camera). */
const pickHeadset = async (index: number) => {
  const user = userEvent.setup();
  render(<CallSettingsMenu />);
  await user.click(
    screen.getByRole('button', { name: 'Audio & video settings' }),
  );
  const select = (await screen.findAllByRole('combobox'))[index];
  await user.click(select);
  await user.click(await screen.findByRole('option', { name: 'Headset' }));
};

describe('CallSettingsMenu', () => {
  beforeEach(() => {
    setActiveMediaDevice.mockReset();
    setActiveMediaDevice.mockResolvedValue(undefined);
    vi.mocked(useNotify().showError).mockClear();
  });

  it('switches device without closing the drawer it is docked in', async () => {
    const user = userEvent.setup();
    renderDockedCall();
    await screen.findByTestId('dock-slot');

    await user.click(
      screen.getByRole('button', { name: 'Audio & video settings' }),
    );
    const [microphone] = await screen.findAllByRole('combobox');
    await user.click(microphone);
    // Inline in the popover, not portalled: a second fixed layer in or beside
    // the drawer is what Safari mis-composited.
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      (await screen.findByRole('listbox')).closest(
        '.call-device-settings-popover',
      ),
    ).not.toBeNull();
    await user.click(await screen.findByRole('option', { name: 'Headset' }));

    expect(setActiveMediaDevice).toHaveBeenCalledWith('headset');
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.getElementById('kt_drawer')).toHaveClass('drawer-on');
  });

  it('tells the user when the microphone cannot be switched to', async () => {
    setActiveMediaDevice.mockRejectedValue(domError('NotReadableError'));
    await pickHeadset(0);

    expect(setActiveMediaDevice).toHaveBeenCalledWith('headset');
    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'The microphone is in use by another application.',
      ),
    );
    // The hook's active device did not move, so neither does the select.
    expect(screen.getAllByText('Built-in microphone')).toHaveLength(3);
    expect(screen.queryByText('Headset')).not.toBeInTheDocument();
  });

  it('maps a camera switch failure to the camera message', async () => {
    setActiveMediaDevice.mockRejectedValue(domError('OverconstrainedError'));
    await pickHeadset(2);

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'No camera was found.',
      ),
    );
  });

  it('names the speaker when switching the output fails', async () => {
    setActiveMediaDevice.mockRejectedValue(domError('NotFoundError'));
    await pickHeadset(1);

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'Could not switch the speaker.',
      ),
    );
  });

  it('says the switch failed for an unexpected camera error', async () => {
    setActiveMediaDevice.mockRejectedValue(domError('TypeError'));
    await pickHeadset(2);

    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        'Could not switch the camera.',
      ),
    );
  });

  it('stays silent when the switch succeeds', async () => {
    await pickHeadset(0);

    expect(setActiveMediaDevice).toHaveBeenCalledWith('headset');
    await Promise.resolve();
    expect(useNotify().showError).not.toHaveBeenCalled();
  });
});
