import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createPortal } from 'react-dom';
import { describe, expect, it } from 'vitest';

import { TableWithTabs } from './TableWithTabs';

// A tab that puts its own control into the page toolbar, the way a Table tab
// or a TabToolbar does.
const makeTab = (key: string, action: string) => ({
  key,
  title: key,
  component: ({ portal }) =>
    portal?.toolbar
      ? createPortal(<button>{action}</button>, portal.toolbar)
      : null,
});

const renderPage = () =>
  render(
    <TableWithTabs
      title="Page"
      tabs={[
        makeTab('first', 'First action'),
        makeTab('second', 'Second action'),
      ]}
    />,
  );

describe('TableWithTabs', () => {
  it('keeps the toolbar controls when the open tab is clicked again', async () => {
    renderPage();
    expect(screen.getByText('First action')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'first' }));

    expect(screen.getByText('First action')).toBeVisible();
  });

  it('replaces the previous tab controls when another tab is selected', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('tab', { name: 'second' }));

    expect(screen.getByText('Second action')).toBeVisible();
    // The old pane fades out and then unmounts (unmountOnExit). How far the
    // fade has got when this line runs is timing, so wait for the end state:
    // its control is gone from the shared toolbar.
    await waitFor(() =>
      expect(screen.queryByText('First action')).not.toBeInTheDocument(),
    );
  });
});
