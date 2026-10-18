import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Navigation/Header search/SearchInput',
  component: SearchInput,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

// The field is as wide as the form around it, not a fixed width of its own.
const expectFillsForm = async (input: HTMLElement) => {
  // A width class on the input (`w-lg-325px` once did) fixes it at one size
  // from a breakpoint up, which a narrow test viewport never reaches, so the
  // rule is checked directly: width belongs to the container.
  await expect(input.className).not.toMatch(/(^|\s)(w-(?!full)|mw-|max-w-)/);
  const form = input.closest('form')!;
  await expect(Math.round(input.getBoundingClientRect().width)).toBe(
    Math.round(form.getBoundingClientRect().width),
  );
};

const result = { isLoading: false, isRefetching: false } as any;

const Harness = ({ initial = '' }: { initial?: string }) => {
  const [query, setQuery] = useState(initial);
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <SearchInput
        result={result}
        query={query}
        setQuery={setQuery}
        show
        showShortcut
      />
    </div>
  );
};

/** The field fills the width it is given, with or without a query. */
export const FillsItsContainer: Story = {
  name: 'Fills its container',
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByPlaceholderText('Search...');
    await expectFillsForm(input);
  },
};

export const WithQuery: Story = {
  name: 'With a query',
  render: () => <Harness initial="dd" />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByPlaceholderText('Search...');
    await expectFillsForm(input);
  },
};
