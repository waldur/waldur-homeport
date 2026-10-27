import type { Meta, StoryObj } from '@storybook/react-vite';

import { contrastRatio, parseColor } from './contrast';
import backgroundCss from './css/semantic/background.css?raw';
import bordersCss from './css/semantic/borders.css?raw';
import brandCss from './css/semantic/brand.css?raw';
import statusCss from './css/semantic/status.css?raw';
import textCss from './css/semantic/text.css?raw';
import themeCss from './css/tailwind/theme.css?raw';
import { useResolvedVar } from './react';
import { parseTokenFile, utilitiesByToken } from './stories/tokenSource';
import { TokenPage, TokenTable } from './stories/TokenTable';

const meta: Meta = {
  title: 'Foundations/Semantic Colors',
  parameters: {
    docs: {
      description: {
        component:
          'The theme-aware roles components read (semantic/*.css), listed from the stylesheets themselves: each token with its Tailwind utility, its light and dark source values, and the value the page resolves now. Switch the toolbar theme to see the dark column take effect. The primitive ramps they point at are on Foundations/Colors.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const utilities = utilitiesByToken(themeCss);
const text = parseTokenFile(textCss);
const background = parseTokenFile(backgroundCss);
const borders = parseTokenFile(bordersCss);
const brand = parseTokenFile(brandCss);
const status = parseTokenFile(statusCss);

/** Neutral text and icons: one scale, primary … senary, plus disabled. */
export const Text: Story = {
  render: () => (
    <TokenPage title="Text" intro={text.doc}>
      <TokenTable file={text} utilities={utilities} contrastOn="--card-bg" />
    </TokenPage>
  ),
};

/** Surfaces: the page, cards, the neutral fills and the hover fill. */
export const Backgrounds: Story = {
  render: () => (
    <TokenPage title="Backgrounds" intro={background.doc}>
      <TokenTable file={background} utilities={utilities} />
    </TokenPage>
  ),
};

/** Borders and drawn lines. */
export const Borders: Story = {
  render: () => (
    <TokenPage title="Borders and lines" intro={borders.doc}>
      <TokenTable file={borders} utilities={utilities} />
    </TokenPage>
  ),
};

/**
 * Every role that paints the tenant's brand colour. Text and marks show
 * their contrast on a card, where `text-brand` is checked against WCAG AA.
 */
export const Brand: Story = {
  render: () => (
    <TokenPage title="Brand" intro={brand.doc}>
      <TokenTable file={brand} utilities={utilities} contrastOn="--card-bg" />
    </TokenPage>
  ),
};

// --- Status matrix -----------------------------------------------------------

const SLOTS = ['bg', 'border', 'solid', 'fg'] as const;
/** Intents in source order, from the `--status-<intent>-<slot>` names. */
const INTENTS = [
  ...new Set(
    status.tokens
      .map((t) => /^--status-(\w+)-(?:bg|border|solid|fg)$/.exec(t.name)?.[1])
      .filter(Boolean) as string[],
  ),
];
const has = (intent: string, slot: string) =>
  status.tokens.some((t) => t.name === `--status-${intent}-${slot}`);

function Ratio({ fg, bg }: { fg: string; bg: string }) {
  const a = useResolvedVar(fg);
  const b = useResolvedVar(bg);
  if (!parseColor(a) || !parseColor(b)) return null;
  const ratio = contrastRatio(a, b);
  return (
    <span
      className={`font-mono text-[11px] ${ratio >= 4.5 ? 'text-success' : 'text-danger'}`}
    >
      {ratio.toFixed(1)}:1
    </span>
  );
}

function IntentRow({ intent }: { intent: string }) {
  const slot = (s: string) => `var(--status-${intent}-${s})`;
  return (
    <div className="contents">
      <div className="py-2.5 font-mono text-xs font-semibold text-primary">
        {intent}
      </div>
      <div className="py-2.5">
        {has(intent, 'bg') && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: slot('bg'),
              color: slot('fg'),
              border: has(intent, 'border')
                ? `1px solid ${slot('border')}`
                : undefined,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: slot('fg') }}
            />
            Pill on -bg
          </span>
        )}
      </div>
      <div className="py-2.5">
        {has(intent, 'solid') ? (
          <span
            className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium"
            style={{ background: slot('solid'), color: 'var(--fg-white)' }}
          >
            Solid
          </span>
        ) : (
          <span className="text-xs text-quinary">no -solid</span>
        )}
      </div>
      <div className="py-2.5 text-sm font-medium" style={{ color: slot('fg') }}>
        Text on the card
      </div>
      <div className="flex flex-col py-2.5">
        <span className="text-[11px] text-quaternary">
          on card <Ratio fg={`--status-${intent}-fg`} bg="--card-bg" />
        </span>
        <span className="text-[11px] text-quaternary">
          on page <Ratio fg={`--status-${intent}-fg`} bg="--page-bg" />
        </span>
        {has(intent, 'bg') && (
          <span className="text-[11px] text-quaternary">
            on -bg{' '}
            <Ratio fg={`--status-${intent}-fg`} bg={`--status-${intent}-bg`} />
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The status matrix: one row per intent, built from the slots status.css
 * defines (`info` and `neutral` have -bg and -fg only). Every -fg must clear
 * 4.5:1 on the card, the page and its own -bg in both themes, which
 * statusContrast.test.ts enforces; the ratios here are live.
 */
export const Status: Story = {
  render: () => (
    <TokenPage title="Status matrix" intro={status.doc}>
      <div
        className="mb-5 grid items-center gap-x-6 rounded-md border-[1px] border-secondary bg-[var(--card-bg)] px-3 [&>.contents>*]:border-t-[1px] [&>.contents>*]:border-t-secondary"
        style={{ gridTemplateColumns: '6rem repeat(3, auto) 1fr' }}
      >
        {['Intent', '-bg + -fg', '-solid', '-fg', 'Contrast of -fg'].map(
          (h) => (
            <div
              key={h}
              className="py-1.5 text-[11px] font-semibold uppercase tracking-wide text-quaternary"
            >
              {h}
            </div>
          ),
        )}
        {INTENTS.map((intent) => (
          <IntentRow key={intent} intent={intent} />
        ))}
      </div>
      <TokenTable
        file={status}
        utilities={utilities}
        filter={(t) => SLOTS.some((s) => t.name.endsWith(`-${s}`))}
      />
    </TokenPage>
  ),
};
