import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CaretUpDownButtons } from './CaretUpDownButtons';

/**
 * A stacked pair of small carets that move an item up or down a list, as in
 * the offering's attribute and plan ordering.
 */
const meta: Meta = {
  title: 'Actions/CaretUpDownButtons',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const Reorderable = () => {
  const [items, setItems] = useState(['CPU', 'RAM', 'Storage']);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next);
  };
  return (
    <ul className="flex w-60 flex-col gap-1.5">
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-center justify-between rounded-lg border border-secondary px-3 py-1.5"
        >
          {item}
          <CaretUpDownButtons
            upLabel={`Move ${item} up`}
            downLabel={`Move ${item} down`}
            onClickUp={() => move(i, i - 1)}
            onClickDown={() => move(i, i + 1)}
          />
        </li>
      ))}
    </ul>
  );
};

export const Default: Story = {
  render: () => <Reorderable />,
};
