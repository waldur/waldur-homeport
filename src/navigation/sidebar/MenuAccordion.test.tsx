import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { MenuAccordion } from './MenuAccordion';
import { useExclusiveOpen } from './utils';

// Radix Collapsible.Content measures its height via ResizeObserver, which
// jsdom doesn't implement — opening the accordion throws without this stub.
// Same fix already used in AssistantComposer.test.tsx for the same reason.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

/**
 * Regression coverage for the Metronic -> Radix Collapsible conversion:
 * MenuAccordion used to have no React state of its own at all —
 * click/open/close was entirely driven by Metronic's own imperative JS
 * reading its menu-trigger attribute. This pins down that a click on
 * the header still toggles the submenu's presence, and that the
 * `disabled` case stays fully static (no trigger, no children ever
 * rendered) exactly as before.
 */
describe('MenuAccordion', () => {
  it('toggles its content open and closed on click', async () => {
    const user = userEvent.setup();
    render(
      <MenuAccordion title="Resources" itemId="test-accordion">
        <div>Nested content</div>
      </MenuAccordion>,
    );

    expect(screen.queryByText('Nested content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resources' }));
    expect(await screen.findByText('Nested content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resources' }));
    expect(screen.queryByText('Nested content')).not.toBeInTheDocument();
  });

  it('renders a disabled accordion as static header-only markup', () => {
    render(
      <MenuAccordion title="Resources" itemId="test-accordion" disabled>
        <div>Nested content</div>
      </MenuAccordion>,
    );

    expect(
      screen.queryByRole('button', { name: 'Resources' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Nested content')).not.toBeInTheDocument();
  });
});

/**
 * Regression coverage for the sibling-exclusivity replacement: Metronic's
 * own imperative menu JS auto-closed every other open accordion in the
 * tree whenever one opened (`_hideAccordions`, gated behind the app's
 * default `accordion.expand: false`). The Radix Collapsible migration
 * replaces that with a shared `useExclusiveOpen` state passed into each
 * sibling's `open`/`onOpenChange` (see UnifiedSidebar.tsx and
 * ResourcesMenu.tsx) — this pins down that two siblings sharing one hook
 * instance actually do close each other, the way the real component tree
 * relies on.
 */
describe('useExclusiveOpen sibling coordination', () => {
  const TwoSiblingAccordions = () => {
    const { openId, toggle } = useExclusiveOpen();
    return (
      <>
        <MenuAccordion
          title="Resources"
          itemId="resources-menu"
          open={openId === 'resources-menu'}
          onOpenChange={toggle('resources-menu')}
        >
          <div>Resources content</div>
        </MenuAccordion>
        <MenuAccordion
          title="Calls"
          itemId="calls-menu"
          open={openId === 'calls-menu'}
          onOpenChange={toggle('calls-menu')}
        >
          <div>Calls content</div>
        </MenuAccordion>
      </>
    );
  };

  it('opening one sibling closes a previously-open one', async () => {
    const user = userEvent.setup();
    render(<TwoSiblingAccordions />);

    await user.click(screen.getByRole('button', { name: 'Resources' }));
    expect(await screen.findByText('Resources content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Calls' }));
    expect(await screen.findByText('Calls content')).toBeInTheDocument();
    expect(screen.queryByText('Resources content')).not.toBeInTheDocument();
  });
});
