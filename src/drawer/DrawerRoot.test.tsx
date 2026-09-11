import * as RadixPopover from '@radix-ui/react-popover';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';

import { DirtyFormContext } from '@/core/DirtyFormContext';
import {
  ActionsDropdownComponent,
  ActionsDropdownItem,
} from '@/table/ActionsDropdown';

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

/**
 * A menu and a popover, the two overlay shapes drawer content actually uses.
 * Both portal outside #kt_drawer, so they only work while Radix can see them
 * as layers nested inside the drawer's modal Dialog.
 */
const OverlayDrawerContent = () => (
  <div>
    <ActionsDropdownComponent size="sm">
      <ActionsDropdownItem onSelect={() => undefined}>
        Start call
      </ActionsDropdownItem>
    </ActionsDropdownComponent>
    <RadixPopover.Root modal={false}>
      <RadixPopover.Trigger asChild>
        <button type="button">3 members</button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content>Mart Tamm</RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  </div>
);

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
    openOverlays: () => openDrawer(OverlayDrawerContent, { title: 'Panel' }),
  };
};

/**
 * The shape MatrixCallHost uses to keep a live call alive while it travels
 * between destinations: an element owned by a React tree outside the drawer,
 * appended into a slot inside it. Its DOM parent is #kt_drawer; its React
 * parent is not.
 */
const renderDrawerWithDockedPortal = () => {
  const container = document.createElement('div');

  const CallHost = () =>
    createPortal(
      <button type="button">Toggle microphone</button>,
      container,
      'call-view',
    );

  const DockSlot = () => {
    const slotRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      slotRef.current?.appendChild(container);
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
  return { open: () => openDrawer(DockSlot, { title: 'Panel' }) };
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

  // The drawer is a *modal* Radix Dialog: it traps focus and disables pointer
  // events outside itself. Radix only exempts a nested menu/popover from both
  // because its layer and focus-scope stacks are module-level singletons — so
  // every Radix primitive has to resolve to one shared copy of
  // react-dismissable-layer and react-focus-scope. Let the package manager
  // install a second copy of either (a duplicate the tree once carried, which
  // is what took out the team-chat header's members and call menus) and the
  // dialog no longer recognises the overlay as nested: it yanks focus back and
  // the overlay dismisses itself in the same tick it opened.
  it('opens a menu nested inside the drawer', async () => {
    const user = userEvent.setup();
    const { openOverlays } = renderDrawer();
    openOverlays();
    const toggle = await waitFor(() => {
      // The icon-only kebab has no accessible name to query by.
      // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
      const el = document.querySelector<HTMLElement>('.dropdown-toggle');
      expect(el).not.toBeNull();
      return el!;
    });

    await user.click(toggle);

    expect(await screen.findByText('Start call')).toBeInTheDocument();
  });

  it('opens a popover nested inside the drawer', async () => {
    const user = userEvent.setup();
    const { openOverlays } = renderDrawer();
    openOverlays();

    await user.click(await screen.findByRole('button', { name: '3 members' }));

    expect(await screen.findByText('Mart Tamm')).toBeInTheDocument();
  });

  // Radix decides a pointerdown is "inside" via an onPointerDownCapture on the
  // layer, which travels the React tree rather than the DOM tree. Content
  // portalled in from a tree outside the dialog therefore reads as outside
  // however deeply the DOM nests it, and the drawer dismisses itself on the
  // first click on the docked call's own controls.
  it('stays open when a control portalled in from outside is clicked', async () => {
    const user = userEvent.setup();
    const { open } = renderDrawerWithDockedPortal();
    open();
    await screen.findByTestId('dock-slot');

    await user.click(screen.getByRole('button', { name: 'Toggle microphone' }));

    // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
    expect(document.getElementById('kt_drawer')).toHaveClass('drawer-on');
  });
});
