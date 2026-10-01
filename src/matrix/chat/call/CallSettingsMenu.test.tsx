import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';

import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';

import { CallSettingsMenu } from './CallSettingsMenu';

const setActiveMediaDevice = vi.fn();

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

describe('CallSettingsMenu', () => {
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
});
