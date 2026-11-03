import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Code, Kbd } from './Code';

/**
 * `Code` is inline code: an identifier, a value, a command or a path inside
 * running text. `Kbd` is a key or a shortcut. Both draw from semantic tokens
 * (--text-code, --bg-code, --inline-shadow; the neutral scale for Kbd), so
 * they look the same in every app that renders them.
 *
 * A caller's size or colour class replaces the component's own. Markdown and
 * HTML the app renders style their inline code through `.rich-text`, to match.
 */
const meta: Meta<typeof Code> = {
  title: 'Data Display/Code',
  component: Code,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Code>;

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      Run <Code>yarn start</Code> and open <Code>localhost:8001</Code>.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const code = within(canvasElement).getByText('yarn start');
    await expect(code.tagName).toBe('CODE');
    await expect(code).toHaveAttribute('data-slot', 'code');
  },
};

export const CallerClasses: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-sm">
      <span>
        Smaller: <Code className="text-xs">uuid</Code>
      </span>
      <span>
        Muted: <Code className="text-quaternary">3f2a9c1e…</Code>
      </span>
      <span>
        Brand: <Code className="text-brand">customer.name</Code>
      </span>
    </div>
  ),
};

export const RenderedMarkdown: Story = {
  name: 'Next to rendered markdown',
  render: () => (
    <div className="flex flex-col gap-2 text-sm">
      <p>
        Component: <Code>yarn start</Code>
      </p>
      {/* What SafeMarkdown and FormattedHtml produce. */}
      <p className="rich-text">
        {/* eslint-disable-next-line waldur-custom/no-raw-code-element -- stands in for rendered HTML */}
        Rendered: <code>yarn start</code>
      </p>
      {/* A fence with no language: a code block, not inline code. */}
      <div className="rich-text">
        <pre>
          <code>yarn build</code>
        </pre>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const component = getComputedStyle(
      canvas.getByText('yarn start', { selector: '[data-slot="code"]' }),
    );
    const rendered = getComputedStyle(
      canvas.getByText('yarn start', { selector: '.rich-text code' }),
    );
    for (const property of [
      'color',
      'backgroundColor',
      'padding',
      'margin',
      'borderRadius',
      'boxShadow',
      'fontFamily',
    ] as const) {
      await expect(rendered[property]).toBe(component[property]);
    }
    const block = getComputedStyle(canvas.getByText('yarn build'));
    await expect(block.boxShadow).toBe('none');
    await expect(block.marginLeft).toBe('0px');
    // The block itself is a tinted panel.
    const pre = getComputedStyle(canvas.getByText('yarn build').parentElement!);
    await expect(pre.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(pre.paddingLeft).toBe('12px');
  },
};

export const Keys: StoryObj<typeof Kbd> = {
  render: () => (
    <p className="flex items-center gap-2 text-sm">
      Search <Kbd>⌘K</Kbd>
      <Kbd className="border border-secondary bg-transparent">Ctrl+K</Kbd>
    </p>
  ),
};
