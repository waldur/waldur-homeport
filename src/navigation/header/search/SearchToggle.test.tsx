import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { SearchToggle } from './SearchToggle';

// The panel's contents are covered by SearchPopover.test.tsx. Here the panel
// only needs its own search field plus a first and a last control, so the
// focus hand-off at both edges of the popover can be observed.
vi.mock('./SearchPopover', async () => {
  const { SearchInput } = await import('./SearchInput');
  return {
    SearchPopover: ({ result, query, show, setQuery }) => (
      <div>
        <SearchInput
          result={result}
          query={query}
          show={show}
          setQuery={setQuery}
        />
        <button type="button">First result</button>
        <button type="button">Last result</button>
      </div>
    ),
  };
});

// Radix gives the popover content role="dialog".
const getPopup = () => screen.queryByRole('dialog');

// Both fields are plain "Search..." textboxes; the header one renders in
// place while the panel's is portaled to the end of the document.
const getHeaderInput = () => screen.getAllByRole('textbox')[0];

const getPopupInput = () =>
  within(screen.getByRole('dialog')).getByRole('textbox');

const expectClosed = () => waitFor(() => expect(getPopup()).toBeNull());

// jsdom loads no stylesheets, so this stands in for the desktop breakpoint:
// the field is shown and its mobile-only search button is not.
const renderHeader = (props: { compact?: boolean } = {}) =>
  renderWithProviders(
    <>
      <style>{'.d-lg-none { display: none; }'}</style>
      <button type="button">Before</button>
      <SearchToggle {...props} />
      <button type="button">After</button>
    </>,
  );

describe('SearchToggle keyboard navigation', () => {
  const user = userEvent.setup();

  it('lets Tab pass through the closed search field without opening the panel', async () => {
    renderHeader();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

    await user.tab();
    expect(getHeaderInput()).toHaveFocus();
    expect(getPopup()).toBeNull();

    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(getPopup()).toBeNull();
  });

  it('opens on Enter, walks the panel with Tab and leaves to the next header control', async () => {
    renderHeader();

    getHeaderInput().focus();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(getPopupInput()).toHaveFocus());

    await user.tab();
    expect(screen.getByRole('button', { name: 'First result' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Last result' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await expectClosed();
  });

  it('returns to the header field on Shift+Tab from the first panel control', async () => {
    renderHeader();

    getHeaderInput().focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(getPopupInput()).toHaveFocus());

    await user.tab({ shift: true });
    expect(getHeaderInput()).toHaveFocus();
    await expectClosed();

    // Focus alone must not reopen it, or Tab would loop forever.
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(getPopup()).toBeNull();
  });

  it('still closes on Escape and hands focus back to the header field', async () => {
    renderHeader();

    getHeaderInput().focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(getPopupInput()).toHaveFocus());

    await user.keyboard('{Escape}');
    await expectClosed();
    expect(getHeaderInput()).toHaveFocus();
  });

  it('opens when typing and keeps the typed text with the caret at the end', async () => {
    renderHeader();

    getHeaderInput().focus();
    await user.keyboard('ab');

    await waitFor(() => expect(getPopupInput()).toHaveFocus());
    expect(getPopupInput()).toHaveValue('ab');
    expect(getPopupInput()).toHaveProperty('selectionStart', 2);
  });

  it('in compact mode returns focus to the search button after Escape', async () => {
    renderHeader({ compact: true });

    const toggle = screen.getByRole('button', { name: 'Search' });
    await user.click(toggle);
    await waitFor(() => expect(getPopupInput()).toHaveFocus());

    await user.keyboard('{Escape}');
    await expectClosed();
    expect(toggle).toHaveFocus();
  });
});
