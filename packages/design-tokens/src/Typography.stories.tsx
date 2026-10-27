import type { Meta, StoryObj } from '@storybook/react-vite';

import typographyCss from './css/primitives/typography.css?raw';
import { parseTokenFile } from './stories/tokenSource';
import { TokenPage, Mono } from './stories/TokenTable';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Standard typographic scale, weights, and text elements used across Waldur. Font sizes and line-heights are anchored to Inter with monospace code support.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const TypeScale: Story = {
  render: () => (
    <div className="p-5 bg-[var(--page-bg)] space-y-8 max-w-4xl">
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-primary border-b border-secondary pb-1.5">
          Headings
        </h3>
        <p className="text-[11px] text-quaternary -mt-2">
          All typographic steps (<strong>xs</strong> through{' '}
          <strong>4xl</strong>) are pinned to exact pixel values in
          primitives/typography.css's <Mono className="">--text-*</Mono> theme
          block, ensuring consistent rendering at non-standard root font sizes.
        </p>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">
            Display (3xl)
          </span>
          <h1 className="m-0 text-3xl font-bold text-primary flex-1">
            Cloud Resource Management
          </h1>
          <span className="font-mono text-xs text-quinary">30px, pinned</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">H1 (2xl)</span>
          <h1 className="m-0 text-2xl font-bold text-primary flex-1">
            Projects and Allocations
          </h1>
          <span className="font-mono text-xs text-quinary">24px, pinned</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">H2 (xl)</span>
          <h2 className="m-0 text-xl font-semibold text-primary flex-1">
            Virtual Machines Overview
          </h2>
          <span className="font-mono text-xs text-quinary">20px, pinned</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">H3 (lg)</span>
          <h3 className="m-0 text-lg font-semibold text-primary flex-1">
            Resource Details & Quotas
          </h3>
          <span className="font-mono text-xs text-quinary">18px, pinned</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">H4 (base)</span>
          <h4 className="m-0 text-base font-semibold text-primary flex-1">
            Network Configuration
          </h4>
          <span className="font-mono text-xs text-quinary">16px, pinned</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-semibold text-primary border-b border-secondary pb-1.5">
          Body Text & Monospace
        </h3>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">Body Base</span>
          <p className="m-0 text-base text-primary flex-1">
            Standard paragraph text used for primary documentation,
            descriptions, and content copy.
          </p>
          <span className="font-mono text-xs text-quinary">16px / Regular</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">
            Body Small
          </span>
          <p className="m-0 text-sm text-quaternary flex-1">
            Secondary text size used in table cells, card body text, sidebar
            links, and form descriptions.
          </p>
          <span className="font-mono text-xs text-quinary">14px / Regular</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-secondary pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">
            Caption (xs)
          </span>
          <p className="m-0 text-xs text-quinary flex-1">
            Fine print, badge text, helper hints, timestamp indicators, and
            table headers.
          </p>
          <span className="font-mono text-xs text-quinary">12px / Medium</span>
        </div>

        <div className="flex items-baseline justify-between pb-2.5">
          <span className="font-mono text-xs text-quinary w-24">Monospace</span>
          <Mono className="text-xs bg-primary-hover px-1.5 py-1 rounded text-primary flex-1 max-w-fit">
            ssh -i ~/.ssh/id_rsa user@192.168.1.100
          </Mono>
          <span className="font-mono text-xs text-quinary">Code / Mono</span>
        </div>
      </div>
    </div>
  ),
};

const typography = parseTokenFile(typographyCss);
const value = (name: string) =>
  typography.tokens.find((t) => t.name === name)?.values.light;
/** The font stack: the file's `--font-*` key. */
const fontStack = typography.tokens.find((t) => t.name.startsWith('--font-'));
/** The pinned sizes, from `--text-<size>` keys that have a line height. */
const SIZES = typography.tokens
  .map((t) => /^--text-([\w]+)$/.exec(t.name)?.[1])
  .filter((size): size is string => Boolean(size));

/**
 * The type tokens this package pins (`primitives/typography.css`), each set
 * in its own size and line height, and the font stack, which reads
 * the tenant's `--font-family` (Inter or Maven Pro, set at bootstrap).
 */
export const Tokens: Story = {
  render: () => (
    <TokenPage title="Type tokens" intro={typography.doc}>
      <div className="mb-5 rounded-md border-[1px] border-secondary bg-[var(--card-bg)] p-3">
        <Mono className="text-xs text-primary">{fontStack?.name}</Mono>
        <Mono className="ml-3 text-[11px] text-tertiary">
          {fontStack && Object.values(fontStack.values)[0]}
        </Mono>
      </div>
      <div className="grid grid-cols-[8rem_10rem_1fr] items-baseline gap-y-4 rounded-md border-[1px] border-secondary bg-[var(--card-bg)] p-3">
        {SIZES.map((size) => (
          <div key={size} className="contents">
            <Mono className="text-xs text-primary">text-{size}</Mono>
            <Mono className="text-[11px] text-quaternary">
              {value(`--text-${size}`)} / {value(`--text-${size}--line-height`)}
            </Mono>
            <span
              className="text-primary"
              style={{
                // eslint-disable-next-line waldur-custom/require-font-size-scale
                fontSize: `var(--text-${size})`,
                lineHeight: `var(--text-${size}--line-height)`,
              }}
            >
              Projects and allocations across every cloud.
            </span>
          </div>
        ))}
      </div>
    </TokenPage>
  ),
};
