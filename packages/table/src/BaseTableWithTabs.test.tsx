import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BaseTableWithTabs } from './BaseTableWithTabs';

const tabs = [
  { key: 'first', title: 'First', component: () => <p>First pane</p> },
  { key: 'second', title: 'Second', component: () => <p>Second pane</p> },
];

describe('BaseTableWithTabs', () => {
  it('keeps the open tab itself when the caller does not', async () => {
    render(<BaseTableWithTabs title="Page" tabs={tabs} />);
    expect(screen.getByText('First pane')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Second' }));

    expect(await screen.findByText('Second pane')).toBeVisible();
  });

  it('shows the tab the caller keeps and reports a selection', async () => {
    const onSelect = vi.fn();
    render(
      <BaseTableWithTabs
        title="Page"
        tabs={tabs}
        activeKey="second"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText('Second pane')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'First' }));

    expect(onSelect).toHaveBeenCalledWith('first');
  });
});
