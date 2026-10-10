import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EmbeddedTabs } from './EmbeddedTabs';

const tabs = [
  { key: 'one', title: 'One', content: <p>First panel</p>, count: 3 },
  {
    key: 'two',
    title: 'Two',
    content: <p>Second panel</p>,
    countLoading: true,
  },
  { key: 'three', title: 'Three', content: <p>Third panel</p>, hidden: true },
  { key: 'four', title: 'Four', content: <p>Fourth panel</p> },
];

describe('EmbeddedTabs', () => {
  it('opens the default tab and mounts only its panel', () => {
    render(<EmbeddedTabs tabs={tabs} defaultValue="one" />);

    expect(screen.getByText('First panel')).toBeInTheDocument();
    expect(screen.queryByText('Second panel')).not.toBeInTheDocument();
  });

  it('leaves hidden tabs out', () => {
    render(<EmbeddedTabs tabs={tabs} defaultValue="one" />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(
      screen.queryByRole('tab', { name: /Three/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the count, and a spinner instead while it loads', () => {
    render(<EmbeddedTabs tabs={tabs} defaultValue="one" />);

    expect(screen.getByRole('tab', { name: /One/ })).toHaveTextContent('3');
    expect(screen.getByRole('tab', { name: /Two/ })).not.toHaveTextContent(
      /\d/,
    );
    expect(screen.getByRole('tab', { name: 'Four' })).toBeInTheDocument();
  });

  it('switches panels on click and unmounts the one it leaves', async () => {
    render(<EmbeddedTabs tabs={tabs} defaultValue="one" />);

    await userEvent.click(screen.getByRole('tab', { name: /Four/ }));

    expect(screen.getByText('Fourth panel')).toBeInTheDocument();
    expect(screen.queryByText('First panel')).not.toBeInTheDocument();
  });

  it('opens the first visible tab when no default is given', () => {
    render(<EmbeddedTabs tabs={tabs} />);

    expect(screen.getByText('First panel')).toBeInTheDocument();
  });

  it('opens the first visible tab when the default is hidden', () => {
    render(<EmbeddedTabs tabs={tabs} defaultValue="three" />);

    expect(screen.queryByText('Third panel')).not.toBeInTheDocument();
    expect(screen.getByText('First panel')).toBeInTheDocument();
  });

  it('falls back when the open tab becomes hidden', () => {
    const { rerender } = render(
      <EmbeddedTabs tabs={tabs} defaultValue="four" />,
    );
    expect(screen.getByText('Fourth panel')).toBeInTheDocument();

    rerender(
      <EmbeddedTabs
        tabs={tabs.map((tab) =>
          tab.key === 'four' ? { ...tab, hidden: true } : tab,
        )}
        defaultValue="four"
      />,
    );

    expect(screen.getByText('First panel')).toBeInTheDocument();
  });

  it('renders the header above the strip', () => {
    render(
      <EmbeddedTabs tabs={tabs} defaultValue="one" header={<h3>Team</h3>} />,
    );

    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
  });
});
