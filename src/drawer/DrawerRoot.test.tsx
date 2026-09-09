import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DirtyFormContext } from '@/core/DirtyFormContext';

import { useDrawer } from './actions';
import { DrawerProvider } from './DrawerContext';
import { DrawerRoot } from './DrawerRoot';

const DrawerContent = ({ close }: { close?: () => void }) => (
  <div data-testid="drawer-content">
    <button type="button" onClick={() => close?.()}>
      Close from content
    </button>
  </div>
);

const DirtyDrawerContent = () => {
  const { setIsDirty } = useContext(DirtyFormContext);
  useEffect(() => {
    setIsDirty(true);
  }, [setIsDirty]);
  return <div data-testid="dirty-drawer-content">Editing…</div>;
};

const OpenButton = ({
  onOpen,
}: {
  onOpen: (open: ReturnType<typeof useDrawer>['openDrawer']) => void;
}) => {
  const { openDrawer } = useDrawer();
  onOpen(openDrawer);
  return null;
};

const renderDrawer = () => {
  let openDrawer!: ReturnType<typeof useDrawer>['openDrawer'];
  render(
    <DrawerProvider>
      <OpenButton onOpen={(fn) => (openDrawer = fn)} />
      <DrawerRoot />
    </DrawerProvider>,
  );
  return {
    open: () => openDrawer(DrawerContent, { title: 'Panel' }),
    openDirty: () => openDrawer(DirtyDrawerContent, { title: 'Panel' }),
  };
};

describe('DrawerRoot', () => {
  it('is closed and not interactive before opening', () => {
    renderDrawer();
    expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    // Radix's Presence doesn't mount #kt_drawer at all until first opened
    // (no forceMount — see DrawerRoot.tsx's comment on why).
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.getElementById('kt_drawer')).not.toBeInTheDocument();
  });

  it('opens with the given component, title, and an overlay', async () => {
    const { open } = renderDrawer();
    open();

    expect(await screen.findByTestId('drawer-content')).toBeInTheDocument();
    expect(screen.getByText('Panel')).toBeInTheDocument();
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.getElementById('kt_drawer')).toHaveClass('drawer-on');
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.querySelector('.drawer-overlay')).toBeInTheDocument();
  });

  it('closes via the header close button and removes the overlay', async () => {
    const user = userEvent.setup();
    const { open } = renderDrawer();
    open();
    await screen.findByTestId('drawer-content');

    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      // jsdom applies no real CSS, so Presence sees no exit animation and
      // unmounts #kt_drawer immediately rather than keeping it around
      // through the (real-browser-only) slide-out.
      // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
      expect(document.getElementById('kt_drawer')).not.toBeInTheDocument();
    });
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.querySelector('.drawer-overlay')).not.toBeInTheDocument();
  });

  it('closes when the content calls the injected close prop', async () => {
    const user = userEvent.setup();
    const { open } = renderDrawer();
    open();
    await screen.findByTestId('drawer-content');

    await user.click(screen.getByText('Close from content'));

    await waitFor(() => {
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    });
  });

  it('keeps the drawer open when a dirty form close is not confirmed', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { openDirty } = renderDrawer();
    openDirty();
    await screen.findByTestId('dirty-drawer-content');

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByTestId('dirty-drawer-content')).toBeInTheDocument();
    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.getElementById('kt_drawer')).toHaveClass('drawer-on');
    confirmSpy.mockRestore();
  });

  it('closes a dirty form once the confirm is accepted', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { openDirty } = renderDrawer();
    openDirty();
    await screen.findByTestId('dirty-drawer-content');

    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('dirty-drawer-content'),
      ).not.toBeInTheDocument();
    });
    confirmSpy.mockRestore();
  });
});
