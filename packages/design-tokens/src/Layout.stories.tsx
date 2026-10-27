import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import breakpointsCss from './css/primitives/breakpoints.css?raw';
import radiusCss from './css/primitives/radius.css?raw';
import spacingCss from './css/primitives/spacing.css?raw';
import zIndexCss from './css/primitives/zIndex.css?raw';
import { parseTokenFile, type Token } from './stories/tokenSource';
import { Prose, TokenPage, Mono } from './stories/TokenTable';

const meta: Meta = {
  title: 'Foundations/Layout',
  parameters: {
    docs: {
      description: {
        component:
          "Spacing, corner radius, breakpoints and stacking order, read from primitives/*.css. These are Tailwind theme keys: the utility is the key's name (`--radius-modal` is `rounded-modal`, `--z-index-tooltip` is `z-tooltip`).",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const value = (t: Token) => Object.values(t.values)[0];
const px = (v: string) => Number.parseFloat(v);

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border-[1px] border-secondary bg-[var(--card-bg)] p-3">
      {children}
    </div>
  );
}

// --- Spacing -----------------------------------------------------------------

const spacing = parseTokenFile(spacingCss);
const STEPS = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16];

/**
 * Tailwind multiplies one base for every padding, margin, gap and size
 * utility: `p-4` is 4 × the base (spacing.css).
 */
export const Spacing: Story = {
  render: () => {
    // The file's one token is the base.
    const [base] = spacing.tokens;
    return (
      <TokenPage title="Spacing" intro={spacing.doc}>
        <p className="mb-3 text-xs text-quaternary">
          Base <Mono>{base?.name}</Mono> ={' '}
          <Mono className="">{base && value(base)}</Mono>. A step N (
          <Mono className="">p-N</Mono>, <Mono className="">gap-N</Mono>, …) is
          N × the base.
        </p>
        <Frame>
          <div className="grid grid-cols-[4rem_5rem_1fr] items-center gap-y-2">
            {STEPS.map((n) => (
              <div key={n} className="contents">
                <Mono className="text-xs text-primary">{n}</Mono>
                <Mono className="text-[11px] text-quaternary">
                  {base ? `${n * px(value(base))}px` : ''}
                </Mono>
                <div
                  className="h-3 rounded-sm bg-[var(--bg-brand-solid)]"
                  style={{ width: base ? `${n * px(value(base))}px` : 0 }}
                />
              </div>
            ))}
          </div>
        </Frame>
      </TokenPage>
    );
  },
};

// --- Radius ------------------------------------------------------------------

const radius = parseTokenFile(radiusCss);

function RadiusTile({
  name,
  source,
  note,
  className,
}: {
  name: string;
  source?: string;
  note?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState('');
  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) {
        setMeasured(getComputedStyle(ref.current).borderTopLeftRadius);
      }
    };
    measure();
    // Metronic's stylesheet sets the 13px root the rem steps scale with. The
    // theme decorator adds it after this first render, so re-measure when a
    // stylesheet is added to <head> and again when it has loaded.
    const onAdded = new MutationObserver((records) => {
      measure();
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLLinkElement) {
            node.addEventListener('load', measure, { once: true });
          }
        });
      }
    });
    onAdded.observe(document.head, { childList: true });
    document
      .querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')
      .forEach((link) =>
        link.addEventListener('load', measure, { once: true }),
      );
    return () => onAdded.disconnect();
  }, []);
  const full = name === '--radius-full';
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        ref={ref}
        className={`size-16 border-[1px] border-[var(--border-brand-solid)] bg-brand-subtle ${className ?? ''}`}
        // eslint-disable-next-line waldur-custom/enforce-border-radius-tokens
        style={source ? { borderRadius: `var(${name}, ${source})` } : undefined}
      />
      <Mono className="text-[11px] text-primary">
        {name.replace('--radius-', 'rounded-')}
      </Mono>
      <span className="text-[11px] text-quaternary">
        {full ? 'pill / circle' : measured}
      </span>
      <span className="text-[10px] text-quinary">
        {source ? `pinned: ${source}` : 'Tailwind default'}
      </span>
      {note && (
        <span className="max-w-[10rem] text-[10px] text-quinary">
          <Prose text={note} />
        </span>
      )}
    </div>
  );
}

/**
 * The corner radii this package pins (`radius.css`). All scale steps are pinned
 * in physical pixels to prevent fractional rem compression under Metronic's forced
 * 13px root font size.
 */
export const Radius: Story = {
  render: () => (
    <TokenPage title="Radius" intro={radius.doc}>
      <Frame>
        <div className="flex flex-wrap gap-6">
          {radius.tokens.map((t) => (
            <RadiusTile
              key={t.name}
              name={t.name}
              source={value(t)}
              note={t.note}
            />
          ))}
          <RadiusTile name="--radius-full" className="rounded-full" />
        </div>
      </Frame>
    </TokenPage>
  ),
};

// --- Breakpoints -------------------------------------------------------------

const breakpoints = parseTokenFile(breakpointsCss);

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

/**
 * The responsive breakpoints, aligned with Bootstrap's so a Tailwind `lg:`
 * and Bootstrap's `col-lg-*` switch at the same width.
 */
export const Breakpoints: Story = {
  render: () => <BreakpointsPage />,
};

function BreakpointsPage() {
  const width = useViewportWidth();
  const max = Math.max(...breakpoints.tokens.map((t) => px(value(t))));
  return (
    <TokenPage title="Breakpoints" intro={breakpoints.doc}>
      <Frame>
        <div className="grid grid-cols-[4rem_5rem_1fr] items-center gap-y-2">
          {breakpoints.tokens.map((t) => {
            const w = px(value(t));
            const active = width >= w;
            return (
              <div key={t.name} className="contents">
                <Mono className="text-xs text-primary">
                  {t.name.replace('--breakpoint-', '')}:
                </Mono>
                <Mono className="text-[11px] text-quaternary">{value(t)}</Mono>
                <div
                  className={`h-3 rounded-sm ${active ? 'bg-[var(--bg-brand-solid)]' : 'bg-tertiary'}`}
                  style={{ width: `${(w / max) * 100}%` }}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-quaternary">
          This frame is {width}px wide: the filled bars are the breakpoints in
          effect.
        </p>
      </Frame>
    </TokenPage>
  );
}

// --- Z-index -----------------------------------------------------------------

const zIndex = parseTokenFile(zIndexCss);

/**
 * The named stacking layers (`z-<name>`), lowest first, each with the
 * reason it sits where it does.
 */
export const ZIndex: Story = {
  name: 'Z-index',
  render: () => {
    const layers = [...zIndex.tokens].sort(
      (a, b) => Number(value(a)) - Number(value(b)),
    );
    return (
      <TokenPage title="Stacking order" intro={zIndex.doc}>
        <Frame>
          <div className="grid grid-cols-[4rem_14rem_1fr] items-start gap-x-4 gap-y-3">
            {layers.map((t) => (
              <div key={t.name} className="contents">
                <Mono className="text-sm font-semibold text-primary">
                  {value(t)}
                </Mono>
                <Mono className="text-xs text-secondary">
                  {t.name.replace('--z-index-', 'z-')}
                </Mono>
                <span className="text-xs text-quaternary">
                  {t.note && <Prose text={t.note} />}
                </span>
              </div>
            ))}
          </div>
        </Frame>
      </TokenPage>
    );
  },
};
