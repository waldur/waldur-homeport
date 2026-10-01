import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CategoriesPanel } from './CategoriesPanel';

// react-bootstrap renders a ListGroupItem carrying only an onClick as a plain
// <li>, so the rows of this dialog used to be unreachable by keyboard: Tab
// cycled the selects above them and never entered the list.
describe('CategoriesPanel', () => {
  const categories = [
    { uuid: '1', title: 'Storage', offering_count: 1 },
    { uuid: '2', title: 'HPC', offering_count: 2 },
  ];

  const renderPanel = () => {
    const selectCategory = vi.fn();
    render(
      <CategoriesPanel
        categories={categories}
        selectedCategory={undefined}
        selectCategory={selectCategory}
        filter={undefined}
        loading={false}
      />,
    );
    return { selectCategory };
  };

  it('reaches the first category with Tab', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.tab();

    expect(screen.getByRole('button', { name: /Storage/ })).toHaveFocus();
  });

  it.each(['{Enter}', ' '])('selects a category with %s', async (key) => {
    const user = userEvent.setup();
    const { selectCategory } = renderPanel();

    await user.tab();
    await user.keyboard(key);

    expect(selectCategory).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: '1' }),
    );
  });

  it('expands a category group to reveal and select its categories', async () => {
    const user = userEvent.setup();
    const selectCategory = vi.fn();
    render(
      <CategoriesPanel
        categories={[
          {
            uuid: 'g1',
            title: 'Compute',
            categories: [
              { uuid: '3', title: 'VMs', offering_count: 1 },
              { uuid: '4', title: 'GPUs', offering_count: 1 },
            ],
          },
        ]}
        selectedCategory={undefined}
        selectCategory={selectCategory}
        filter={undefined}
        loading={false}
      />,
    );

    const group = screen.getByRole('button', { name: /Compute/ });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('VMs')).not.toBeInTheDocument();

    await user.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: /GPUs/ }));
    expect(selectCategory).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: '4' }),
    );

    await user.click(group);
    expect(screen.queryByText('VMs')).not.toBeInTheDocument();
  });
});
